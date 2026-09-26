import { randomBytes } from 'node:crypto'
import { Hono } from 'hono'
import { MongoServerError, ObjectId } from 'mongodb'
import { provisionVolunteer, requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { deleteObject, putObject, readImage, readObject } from './storage.js'

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

const answers = ['skills', 'availability', 'motivation'] as const

function answersFrom(body: Record<string, unknown>) {
  const result: Partial<Record<(typeof answers)[number], string>> = {}
  for (const key of answers) {
    const raw = body[key]
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (value.length > 2000) throw new Error('Answers can be at most 2000 characters')
    if (value) result[key] = value
  }
  return result
}

async function filesFrom(body: Record<string, unknown>): Promise<File[]> {
  const value = body.images ?? body.image
  if (value === undefined) return []
  const list = Array.isArray(value) ? value : [value]
  if (list.length > 3) throw new Error('An application can include at most 3 images')
  return list.filter((item): item is File => item instanceof File)
}

export const publicApplications = new Hono()

publicApplications.post('/', async (c) => {
  const body = await c.req.parseBody({ all: true })
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const opportunityId = typeof body.opportunityId === 'string' ? body.opportunityId : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (!fullName || !email || !opportunityId) {
    return c.json({ error: 'Name, email, and opportunity are required' }, 400)
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: 'Invalid email' }, 400)
  if (!ObjectId.isValid(opportunityId)) return c.json({ error: 'Opportunity not found' }, 400)

  const opportunity = await getDb().collection<OpportunityDoc>('opportunities').findOne({
    _id: new ObjectId(opportunityId),
    public: true,
    status: 'open',
  })
  if (!opportunity) return c.json({ error: 'Opportunity not found' }, 404)

  let extra: ReturnType<typeof answersFrom>
  let images: File[]
  try {
    extra = answersFrom(body)
    images = await filesFrom(body)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid application' }, 400)
  }

  const id = new ObjectId()
  const fileKeys: string[] = []
  try {
    for (const [index, file] of images.entries()) {
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
    fullName,
    email,
    ...extra,
    status: 'submitted',
    submittedAt: new Date(),
  }
  if (phone) doc.phone = phone
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
    application: { id: id.toHexString(), status: 'submitted', opportunityId },
  }, 201)
})

export const applicationRoutes = new Hono<AppEnv>()
applicationRoutes.use('*', requireAdmin)

applicationRoutes.get('/', async (c) => {
  const status = c.req.query('status')
  if (status !== undefined && !(statuses as readonly string[]).includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }
  const docs = await getDb()
    .collection<ApplicationDoc>('volunteer_applications')
    .find(status ? { status: status as ApplicationStatus } : {})
    .sort({ submittedAt: -1 })
    .toArray()
  return c.json({ applications: docs.map(toAdmin) })
})

applicationRoutes.get('/:id/files/:index', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const index = Number(c.req.param('index'))
  const doc = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({
    _id: new ObjectId(c.req.param('id')),
  })
  const key = doc?.fileKeys?.[index]
  if (!doc || !key || !Number.isInteger(index)) return c.json({ error: 'Not found' }, 404)
  const object = await readObject(key)
  if (!object) return c.json({ error: 'Not found' }, 404)
  return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
})

applicationRoutes.get('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({
    _id: new ObjectId(c.req.param('id')),
  })
  if (!doc) return c.json({ error: 'Not found' }, 404)
  return c.json({ application: toAdmin(doc) })
})

applicationRoutes.patch('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => null)
  const next = body && typeof body.status === 'string' ? body.status : ''
  if (!(statuses as readonly string[]).includes(next)) return c.json({ error: 'Invalid status' }, 400)
  const status = next as ApplicationStatus
  const notes = body && typeof body.internalNotes === 'string' ? body.internalNotes.trim() : undefined
  if ((status === 'needs_info' || status === 'declined') && !notes) {
    return c.json({ error: 'A note is required' }, 400)
  }
  if (!ObjectId.isValid(c.get('user').id)) return c.json({ error: 'Invalid reviewer' }, 400)

  const existing = await getDb().collection<ApplicationDoc>('volunteer_applications').findOne({
    _id: new ObjectId(c.req.param('id')),
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
