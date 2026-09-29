import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { email, idParam, required, validate } from './validate.js'

const subjects = ['general', 'volunteer', 'donation', 'partnership'] as const
type Subject = (typeof subjects)[number]

type MessageDoc = {
  _id: ObjectId
  name: string
  email: string
  phone?: string
  subject: Subject
  message: string
  status: 'new' | 'handled'
  createdAt: Date
}

function toAdmin(doc: MessageDoc) {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? null,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt,
  }
}

const messageSchema = z.object({
  name: required('Name, email, and message are required').max(200, 'Name is too long'),
  email,
  phone: z.string().trim().max(40, 'Phone number is too long').optional(),
  subject: z.enum(subjects, { error: 'Invalid subject' }).default('general'),
  message: required('Name, email, and message are required').max(5000, 'Message is too long'),
})

const statusSchema = z.object({ status: z.enum(['new', 'handled'], { error: 'Invalid status' }) })

export const publicContact = new Hono().post('/', validate('json', messageSchema), async (c) => {
  const body = c.req.valid('json')
  const doc: MessageDoc = {
    _id: new ObjectId(),
    name: body.name,
    email: body.email,
    subject: body.subject,
    message: body.message,
    status: 'new',
    createdAt: new Date(),
  }
  if (body.phone) doc.phone = body.phone
  await getDb().collection<MessageDoc>('contact_messages').insertOne(doc)
  return c.json({ message: { id: doc._id.toHexString() } }, 201)
})

export const messageRoutes = new Hono<AppEnv>()
  .use('*', requireAdmin)
  .get('/', async (c) => {
    const docs = await getDb()
      .collection<MessageDoc>('contact_messages')
      .find()
      .sort({ createdAt: -1 })
      .toArray()
    return c.json({ messages: docs.map(toAdmin) })
  })
  .patch('/:id', idParam, validate('json', statusSchema), async (c) => {
    const doc = await getDb().collection<MessageDoc>('contact_messages').findOneAndUpdate(
      { _id: c.req.valid('param').id },
      { $set: { status: c.req.valid('json').status } },
      { returnDocument: 'after' },
    )
    if (!doc) return c.json({ error: 'Not found' }, 404)
    return c.json({ message: toAdmin(doc) })
  })
