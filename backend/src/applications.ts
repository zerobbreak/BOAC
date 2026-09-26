import { randomBytes } from 'node:crypto'
import { Hono } from 'hono'
import { MongoServerError, ObjectId } from 'mongodb'
import { z } from 'zod'
import { provisionVolunteer, requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { deleteObject, putObject, readImage, readObject } from './storage.js'
import { email, idParam, objectId, param, required, validate } from './validate.js'

const statuses = ['submitted', 'under_review', 'needs_info', 'declined', 'accepted'] as const
type ApplicationStatus = (typeof statuses)[number]

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['under_review'],
  under_review: ['needs_info', 'declined', 'accepted'],
  needs_info: ['under_review', 'declined', 'accepted'],
  declined: [],
  accepted: [],
}

type ApplicationDoc = {
  _id: ObjectId
  opportunityId: ObjectId
  fullName: string
  email: string
  phone?: string
  skills?: string
  availability?: string
  motivation?: string
  status: ApplicationStatus
  internalNotes?: string
  fileKeys?: string[]
  reviewedBy?: ObjectId
  submittedAt: Date
}

type OpportunityDoc = {
  _id: ObjectId
  title: string
  status: 'open' | 'closed'
  public: boolean
}

function toAdmin(doc: ApplicationDoc) {
  const id = doc._id.toHexString()
  return {
    id,
    opportunityId: doc.opportunityId.toHexString(),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone ?? null,
    skills: doc.skills ?? '',
    availability: doc.availability ?? '',
    motivation: doc.motivation ?? '',
    status: doc.status,
    internalNotes: doc.internalNotes ?? '',
    files: (doc.fileKeys ?? []).map((_, index) => ({
      index,
      url: `/admin/applications/${id}/files/${index}`,
    })),
    reviewedBy: doc.reviewedBy?.toHexString() ?? null,
    submittedAt: doc.submittedAt,
  }
}

const answer = z.string().trim().max(2000, 'Answers can be at most 2000 characters').optional()
const images = z
  .union([z.instanceof(File), z.array(z.instanceof(File)).max(3, 'An application can include at most 3 images')], {
    error: 'Invalid image',
  })
  .optional()

const applicationForm = z.object({
  fullName: required('Name, email, and opportunity are required'),
  email,
  opportunityId: z
    .string({ error: 'Name, email, and opportunity are required' })
    .refine((value) => ObjectId.isValid(value), 'Opportunity not found')
    .transform((value) => new ObjectId(value)),
  phone: z.string().trim().optional(),
  skills: answer,
  availability: answer,
  motivation: answer,
  images,
  image: images,
})

export const publicApplications = new Hono().post('/', validate('form', applicationForm), async (c) => {
  const body = c.req.valid('form')
  const opportunity = await getDb().collection<OpportunityDoc>('opportunities').findOne({
    _id: body.opportunityId,
    public: true,
    status: 'open',
  })
  if (!opportunity) return c.json({ error: 'Opportunity not found' }, 404)

  const files = [body.images ?? body.image ?? []].flat()
  if (files.length > 3) return c.json({ error: 'An application can include at most 3 images' }, 400)

  const id = new ObjectId()
  const fileKeys: string[] = []
  try {
    for (const [index, file] of files.entries()) {
      const image = await readImage(file)
      const key = `applications/${id.toHexString()}/${index}-${randomBytes(4).toString('hex')}`
      await putObject(key, image.bytes, image.type)
      fileKeys.push(key)
    }
  } catch (error) {
    await Promise.all(fileKeys.map((key) => deleteObject(key).catch(() => undefined)))
    return c.json({ error: error instanceof Error ? error.message : 'Invalid image' }, 400)
  }

  const doc: ApplicationDoc = {
    _id: id,
    opportunityId: opportunity._id,
    fullName: body.fullName,
    email: body.email,
    status: 'submitted',
    submittedAt: new Date(),
  }
  if (body.phone) doc.phone = body.phone
  if (body.skills) doc.skills = body.skills
  if (body.availability) doc.availability = body.availability
  if (body.motivation) doc.motivation = body.motivation
  if (fileKeys.length > 0) doc.fileKeys = fileKeys

  try {
    await getDb().collection<ApplicationDoc>('volunteer_applications').insertOne(doc)
  } catch (error) {
    await Promise.all(fileKeys.map((key) => deleteObject(key).catch(() => undefined)))
    if (error instanceof MongoServerError && error.code === 11000) {
      return c.json({ error: 'An application for this opportunity is already open' }, 409)
    }
    throw error
  }

  return c.json({
    application: { id: id.toHexString(), status: 'submitted' as const, opportunityId: opportunity._id.toHexString() },
  }, 201)
})

const statusSchema = z.enum(statuses, { error: 'Invalid status' })
const fileParams = z.object({ id: objectId(), index: z.coerce.number().int().min(0) })
const reviewSchema = z.object({ status: statusSchema, internalNotes: z.string().trim().optional() })

export const applicationRoutes = new Hono<AppEnv>()
  .use('*', requireAdmin)
  .get('/', validate('query', z.object({ status: statusSchema.optional() })), async (c) => {
    const { status } = c.req.valid('query')
    const docs = await getDb()
      .collection<ApplicationDoc>('volunteer_applications')
      .find(status ? { status } : {})
      .sort({ submittedAt: -1 })
      .toArray()
    return c.json({ applications: docs.map(toAdmin) })
  })
  .get('/:id/files/:index', param(fileParams), async (c) => {
    const { id, index } = c.req.valid('param')
    const doc = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({ _id: id })
    const key = doc?.fileKeys?.[index]
    if (!doc || !key) return c.json({ error: 'Not found' }, 404)
    const object = await readObject(key)
    if (!object) return c.json({ error: 'Not found' }, 404)
    return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
  })
  .get('/:id', idParam, async (c) => {
    const doc = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({
      _id: c.req.valid('param').id,
    })
    if (!doc) return c.json({ error: 'Not found' }, 404)
    return c.json({ application: toAdmin(doc) })
  })
  .patch('/:id', idParam, validate('json', reviewSchema), async (c) => {
    const { status, internalNotes: notes } = c.req.valid('json')
    if ((status === 'needs_info' || status === 'declined') && !notes) {
      return c.json({ error: 'A note is required' }, 400)
    }
    if (!ObjectId.isValid(c.get('user').id)) return c.json({ error: 'Invalid reviewer' }, 400)

    const existing = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({
      _id: c.req.valid('param').id,
    })
    if (!existing) return c.json({ error: 'Not found' }, 404)
    if (!transitions[existing.status].includes(status)) {
      return c.json({ error: 'That review move is not allowed' }, 409)
    }

    const opportunity = await getDb().collection<OpportunityDoc>('opportunities').findOne({
      _id: existing.opportunityId,
    })
    if (!opportunity) return c.json({ error: 'Opportunity not found' }, 404)

    let volunteer: { id: string; email: string; password: string | null } | undefined
    let workId: string | undefined
    if (status === 'accepted') {
      try {
        volunteer = await provisionVolunteer(existing.email, existing.fullName)
      } catch (error) {
        if (error instanceof Error && error.message === 'Email belongs to another role') {
          return c.json({ error: 'Email belongs to another role' }, 409)
        }
        throw error
      }
      if (!ObjectId.isValid(volunteer.id)) return c.json({ error: 'Invalid volunteer' }, 400)
      const now = new Date()
      const work = await getDb().collection('volunteer_work').insertOne({
        volunteerId: new ObjectId(volunteer.id),
        title: opportunity.title,
        status: 'planned',
        opportunityId: opportunity._id,
        createdAt: now,
        updatedAt: now,
      })
      workId = work.insertedId.toHexString()
    }

    const update: Partial<ApplicationDoc> = {
      status,
      reviewedBy: new ObjectId(c.get('user').id),
    }
    if (notes !== undefined) update.internalNotes = notes
    const doc = await getDb().collection<ApplicationDoc>('volunteer_applications').findOneAndUpdate(
      { _id: existing._id, status: existing.status },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!doc) return c.json({ error: 'That review move is not allowed' }, 409)

    if (status === 'accepted' && volunteer && workId) {
      return c.json({
        application: toAdmin(doc),
        volunteer: { id: volunteer.id, email: volunteer.email },
        password: volunteer.password,
        work: { id: workId, title: opportunity.title, status: 'planned' },
      })
    }
    return c.json({ application: toAdmin(doc) })
  })
