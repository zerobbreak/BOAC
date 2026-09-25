import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'

type OpportunityDoc = {
  _id: ObjectId
  title: string
  status: 'open' | 'closed'
  public: boolean
  location?: string
  closingDate?: Date
  createdAt: Date
  updatedAt: Date
}

function toAdmin(doc: OpportunityDoc) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    status: doc.status,
    public: doc.public,
    location: doc.location ?? null,
    closingDate: doc.closingDate ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function toPublic(doc: OpportunityDoc) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    location: doc.location ?? null,
    closingDate: doc.closingDate ?? null,
  }
}

function readDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new Error('Invalid closing date')
  return new Date(value)
}

export const publicOpportunities = new Hono()

publicOpportunities.get('/', async (c) => {
  const docs = await getDb()
    .collection<OpportunityDoc>('opportunities')
    .find({ public: true, status: 'open' })
    .sort({ createdAt: -1 })
    .toArray()
  return c.json({ opportunities: docs.map(toPublic) })
})

export const opportunityRoutes = new Hono<AppEnv>()
opportunityRoutes.use('*', requireAdmin)

opportunityRoutes.get('/', async (c) => {
  const docs = await getDb().collection<OpportunityDoc>('opportunities').find().sort({ createdAt: -1 }).toArray()
  return c.json({ opportunities: docs.map(toAdmin) })
})

opportunityRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const title = body && typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return c.json({ error: 'Title is required' }, 400)
  const status = body.status ?? 'open'
  if (status !== 'open' && status !== 'closed') return c.json({ error: 'Invalid status' }, 400)
  if (typeof body.public !== 'boolean') return c.json({ error: 'Public is required' }, 400)
  let closingDate: Date | undefined
  try {
    closingDate = readDate(body.closingDate)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid closing date' }, 400)
  }
  const now = new Date()
  const doc: OpportunityDoc = {
    _id: new ObjectId(),
    title,
    status,
    public: body.public,
    createdAt: now,
    updatedAt: now,
  }
  if (typeof body.location === 'string' && body.location.trim()) doc.location = body.location.trim()
  if (closingDate) doc.closingDate = closingDate
  await getDb().collection<OpportunityDoc>('opportunities').insertOne(doc)
  return c.json({ opportunity: toAdmin(doc) }, 201)
})

opportunityRoutes.patch('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'No changes' }, 400)
  const update: Partial<OpportunityDoc> = {}
  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (!title) return c.json({ error: 'Title is required' }, 400)
    update.title = title
  }
  if (body.status !== undefined) {
    if (body.status !== 'open' && body.status !== 'closed') return c.json({ error: 'Invalid status' }, 400)
    update.status = body.status
  }
  if (body.public !== undefined) {
    if (typeof body.public !== 'boolean') return c.json({ error: 'Invalid public flag' }, 400)
    update.public = body.public
  }
  if (typeof body.location === 'string') update.location = body.location.trim()
  try {
    if (body.closingDate !== undefined && body.closingDate !== null && body.closingDate !== '') {
      update.closingDate = readDate(body.closingDate)
    }
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid closing date' }, 400)
  }
  if (Object.keys(update).length === 0) return c.json({ error: 'No changes' }, 400)
  update.updatedAt = new Date()
  const doc = await getDb().collection<OpportunityDoc>('opportunities').findOneAndUpdate(
    { _id: new ObjectId(c.req.param('id')) },
    { $set: update },
    { returnDocument: 'after' },
  )
  if (!doc) return c.json({ error: 'Not found' }, 404)
  return c.json({ opportunity: toAdmin(doc) })
})
