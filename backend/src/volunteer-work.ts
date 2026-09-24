import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { requireVolunteer, type AppEnv } from './auth.js'
import { getDb } from './db.js'

const statuses = ['planned', 'in_progress', 'done'] as const
type WorkStatus = (typeof statuses)[number]

type WorkDoc = {
  _id: ObjectId
  volunteerId: ObjectId
  title: string
  status: WorkStatus
  notes?: string
  opportunityId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

function isStatus(value: unknown): value is WorkStatus {
  return typeof value === 'string' && (statuses as readonly string[]).includes(value)
}

function toPublic(doc: WorkDoc) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    status: doc.status,
    notes: doc.notes ?? '',
    opportunityId: doc.opportunityId?.toHexString() ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const volunteer = new Hono<AppEnv>()
volunteer.use('*', requireVolunteer)

volunteer.get('/work', async (c) => {
  const volunteerId = new ObjectId(c.get('user').id)
  const docs = await getDb()
    .collection<WorkDoc>('volunteer_work')
    .find({ volunteerId })
    .sort({ updatedAt: -1 })
    .toArray()
  return c.json({ work: docs.map(toPublic) })
})

volunteer.post('/work', async (c) => {
  const body = await c.req.json().catch(() => null)
  const title = body && typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return c.json({ error: 'Title is required' }, 400)
  const status: WorkStatus = body.status === undefined ? 'planned' : body.status
  if (!isStatus(status)) return c.json({ error: 'Invalid status' }, 400)
  const notes = body && typeof body.notes === 'string' ? body.notes : undefined
  const now = new Date()
  const doc: WorkDoc = {
    _id: new ObjectId(),
    volunteerId: new ObjectId(c.get('user').id),
    title,
    status,
    createdAt: now,
    updatedAt: now,
  }
  if (notes !== undefined) doc.notes = notes
  await getDb().collection<WorkDoc>('volunteer_work').insertOne(doc)
  return c.json({ work: toPublic(doc) }, 201)
})

volunteer.patch('/work/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Title, status, or notes is required' }, 400)

  const update: Partial<Pick<WorkDoc, 'title' | 'status' | 'notes' | 'updatedAt'>> = {}
  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (!title) return c.json({ error: 'Title is required' }, 400)
    update.title = title
  }
  if (body.status !== undefined) {
    if (!isStatus(body.status)) return c.json({ error: 'Invalid status' }, 400)
    update.status = body.status
  }
  if (typeof body.notes === 'string') update.notes = body.notes
  if (Object.keys(update).length === 0) {
    return c.json({ error: 'Title, status, or notes is required' }, 400)
  }

  update.updatedAt = new Date()
  const result = await getDb().collection<WorkDoc>('volunteer_work').findOneAndUpdate(
    { _id: new ObjectId(c.req.param('id')), volunteerId: new ObjectId(c.get('user').id) },
    { $set: update },
    { returnDocument: 'after' },
  )
  if (!result) return c.json({ error: 'Not found' }, 404)
  return c.json({ work: toPublic(result) })
})

export default volunteer
