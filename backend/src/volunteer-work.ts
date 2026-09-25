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

function isStatus(value: unknown): value is WorkStatus {
  return typeof value === 'string' && (statuses as readonly string[]).includes(value)
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

const volunteer = new Hono<AppEnv>()
volunteer.use('*', requireVolunteer)

volunteer.get('/dashboard', async (c) => {
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

volunteer.get('/work', async (c) => {
  const work = await loadOwnWork(new ObjectId(c.get('user').id))
  work.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return c.json({ work })
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
  if (!body) return c.json({ error: 'Title, status, notes, or hours is required' }, 400)

  const update: Partial<Pick<WorkDoc, 'title' | 'status' | 'notes' | 'hours' | 'updatedAt'>> = {}
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
  if (body.hours !== undefined) {
    if (typeof body.hours !== 'number' || !Number.isFinite(body.hours) || body.hours < 0) {
      return c.json({ error: 'Hours must be zero or more' }, 400)
    }
    update.hours = body.hours
  }
  if (Object.keys(update).length === 0) {
    return c.json({ error: 'Title, status, notes, or hours is required' }, 400)
  }

  update.updatedAt = new Date()
  const result = await getDb().collection<WorkDoc>('volunteer_work').findOneAndUpdate(
    { _id: new ObjectId(c.req.param('id')), volunteerId: new ObjectId(c.get('user').id) },
    { $set: update },
    { returnDocument: 'after' },
  )
  if (!result) return c.json({ error: 'Not found' }, 404)
  const items = await loadOwnWork(new ObjectId(c.get('user').id))
  const work = items.find((item) => item.id === result._id.toHexString())
  return c.json({ work: work ?? toPublic(result) })
})

export default volunteer
