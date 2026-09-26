import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { requireVolunteer, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { idParam, required, validate } from './validate.js'

const statuses = ['planned', 'in_progress', 'done'] as const
type WorkStatus = (typeof statuses)[number]

type WorkDoc = {
  _id: ObjectId
  volunteerId: ObjectId
  title: string
  status: WorkStatus
  notes?: string
  opportunityId?: ObjectId
  startsAt?: Date
  hours?: number
  createdAt: Date
  updatedAt: Date
}

type OpportunityDoc = {
  _id: ObjectId
  title: string
  location?: string
}

function toPublic(
  doc: WorkDoc,
  opportunity?: { title: string; location: string | null },
) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    status: doc.status,
    notes: doc.notes ?? '',
    opportunityId: doc.opportunityId?.toHexString() ?? null,
    opportunityTitle: opportunity?.title ?? null,
    location: opportunity?.location ?? null,
    startsAt: doc.startsAt ?? null,
    hours: doc.hours ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function loadOwnWork(volunteerId: ObjectId) {
  const docs = await getDb()
    .collection<WorkDoc>('volunteer_work')
    .find({ volunteerId })
    .toArray()
  const opportunityIds = docs.flatMap((doc) => (doc.opportunityId ? [doc.opportunityId] : []))
  const opportunities = await getDb()
    .collection<OpportunityDoc>('opportunities')
    .find({ _id: { $in: opportunityIds } })
    .toArray()
  const byId = new Map(opportunities.map((item) => [item._id.toHexString(), item]))
  return docs.map((doc) => {
    const opportunity = doc.opportunityId ? byId.get(doc.opportunityId.toHexString()) : undefined
    return toPublic(doc, opportunity && {
      title: opportunity.title,
      location: opportunity.location ?? null,
    })
  })
}

const status = z.enum(statuses, { error: 'Invalid status' })

const createSchema = z.object({
  title: required('Title is required'),
  status: status.default('planned'),
  notes: z.string().optional(),
})

const updateSchema = z
  .object({
    title: required('Title is required').optional(),
    status: status.optional(),
    notes: z.string().optional(),
    hours: z.number({ error: 'Hours must be zero or more' }).finite('Hours must be zero or more').min(0, 'Hours must be zero or more').optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), 'Title, status, notes, or hours is required')

const volunteer = new Hono<AppEnv>()
  .use('*', requireVolunteer)
  .get('/dashboard', async (c) => {
    const user = c.get('user')
    const items = await loadOwnWork(new ObjectId(user.id))
    const upcoming = items
      .filter((item) => item.status !== 'done')
      .sort((a, b) => {
        if (!a.startsAt) return 1
        if (!b.startsAt) return -1
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      })
    const finished = items
      .filter((item) => item.status === 'done')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    const spaces = new Map<string, typeof items>()
    for (const item of items) {
      const name = item.location || item.opportunityTitle || 'Unassigned'
      const group = spaces.get(name) ?? []
      group.push(item)
      spaces.set(name, group)
    }
    return c.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      schedule: { upcoming, finished },
      spaces: [...spaces.entries()].map(([name, assignments]) => ({ name, assignments })),
    })
  })
  .get('/work', async (c) => {
    const work = await loadOwnWork(new ObjectId(c.get('user').id))
    work.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return c.json({ work })
  })
  .post('/work', validate('json', createSchema), async (c) => {
    const body = c.req.valid('json')
    const now = new Date()
    const doc: WorkDoc = {
      _id: new ObjectId(),
      volunteerId: new ObjectId(c.get('user').id),
      title: body.title,
      status: body.status,
      createdAt: now,
      updatedAt: now,
    }
    if (body.notes !== undefined) doc.notes = body.notes
    await getDb().collection<WorkDoc>('volunteer_work').insertOne(doc)
    return c.json({ work: toPublic(doc) }, 201)
  })
  .patch('/work/:id', idParam, validate('json', updateSchema), async (c) => {
    const body = c.req.valid('json')
    const update: Partial<Pick<WorkDoc, 'title' | 'status' | 'notes' | 'hours' | 'updatedAt'>> = {}
    if (body.title !== undefined) update.title = body.title
    if (body.status !== undefined) update.status = body.status
    if (body.notes !== undefined) update.notes = body.notes
    if (body.hours !== undefined) update.hours = body.hours
    update.updatedAt = new Date()
    const result = await getDb().collection<WorkDoc>('volunteer_work').findOneAndUpdate(
      { _id: c.req.valid('param').id, volunteerId: new ObjectId(c.get('user').id) },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!result) return c.json({ error: 'Not found' }, 404)
    const items = await loadOwnWork(new ObjectId(c.get('user').id))
    const work = items.find((item) => item.id === result._id.toHexString())
    return c.json({ work: work ?? toPublic(result) })
  })

export default volunteer
