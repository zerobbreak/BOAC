import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { idParam, optionalDate, required, validate } from './validate.js'

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

const status = z.enum(['open', 'closed'], { error: 'Invalid status' })

const createSchema = z.object({
  title: required('Title is required'),
  status: status.default('open'),
  public: z.boolean({ error: 'Public is required' }),
  location: z.string().trim().optional(),
  closingDate: optionalDate('Invalid closing date'),
})

const updateSchema = z.object({
  title: required('Title is required').optional(),
  status: status.optional(),
  public: z.boolean({ error: 'Invalid public flag' }).optional(),
  location: z.string().trim().optional(),
  closingDate: optionalDate('Invalid closing date'),
})

export const publicOpportunities = new Hono().get('/', async (c) => {
  const docs = await getDb()
    .collection<OpportunityDoc>('opportunities')
    .find({ public: true, status: 'open' })
    .sort({ createdAt: -1 })
    .toArray()
  return c.json({ opportunities: docs.map(toPublic) })
})

export const opportunityRoutes = new Hono<AppEnv>()
  .use('*', requireAdmin)
  .get('/', async (c) => {
    const docs = await getDb().collection<OpportunityDoc>('opportunities').find().sort({ createdAt: -1 }).toArray()
    return c.json({ opportunities: docs.map(toAdmin) })
  })
  .post('/', validate('json', createSchema), async (c) => {
    const body = c.req.valid('json')
    const now = new Date()
    const doc: OpportunityDoc = {
      _id: new ObjectId(),
      title: body.title,
      status: body.status,
      public: body.public,
      createdAt: now,
      updatedAt: now,
    }
    if (body.location) doc.location = body.location
    if (body.closingDate) doc.closingDate = body.closingDate
    await getDb().collection<OpportunityDoc>('opportunities').insertOne(doc)
    return c.json({ opportunity: toAdmin(doc) }, 201)
  })
  .patch('/:id', idParam, validate('json', updateSchema), async (c) => {
    const body = c.req.valid('json')
    const update: Partial<OpportunityDoc> = {}
    if (body.title !== undefined) update.title = body.title
    if (body.status !== undefined) update.status = body.status
    if (body.public !== undefined) update.public = body.public
    if (body.location !== undefined) update.location = body.location
    if (body.closingDate) update.closingDate = body.closingDate
    if (Object.keys(update).length === 0) return c.json({ error: 'No changes' }, 400)
    update.updatedAt = new Date()
    const doc = await getDb().collection<OpportunityDoc>('opportunities').findOneAndUpdate(
      { _id: c.req.valid('param').id },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!doc) return c.json({ error: 'Not found' }, 404)
    return c.json({ opportunity: toAdmin(doc) })
  })
