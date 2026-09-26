import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'

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

export const publicContact = new Hono()

publicContact.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const name = body && typeof body.name === 'string' ? body.name.trim() : ''
  const email = body && typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = body && typeof body.phone === 'string' ? body.phone.trim() : ''
  const message = body && typeof body.message === 'string' ? body.message.trim() : ''
  const subject = body?.subject ?? 'general'
  if (!name || !email || !message) return c.json({ error: 'Name, email, and message are required' }, 400)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: 'Invalid email' }, 400)
  if (!(subjects as readonly string[]).includes(subject)) return c.json({ error: 'Invalid subject' }, 400)
  if (name.length > 200 || phone.length > 40 || message.length > 5000) {
    return c.json({ error: 'Message is too long' }, 400)
  }

  const doc: MessageDoc = {
    _id: new ObjectId(),
    name,
    email,
    subject: subject as Subject,
    message,
    status: 'new',
    createdAt: new Date(),
  }
  if (phone) doc.phone = phone
  await getDb().collection<MessageDoc>('contact_messages').insertOne(doc)
  return c.json({ message: { id: doc._id.toHexString() } }, 201)
})

export const messageRoutes = new Hono<AppEnv>()
messageRoutes.use('*', requireAdmin)

messageRoutes.get('/', async (c) => {
  const docs = await getDb()
    .collection<MessageDoc>('contact_messages')
    .find()
    .sort({ createdAt: -1 })
    .toArray()
  return c.json({ messages: docs.map(toAdmin) })
})

messageRoutes.patch('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => null)
  const status = body?.status
  if (status !== 'new' && status !== 'handled') return c.json({ error: 'Invalid status' }, 400)
  const doc = await getDb().collection<MessageDoc>('contact_messages').findOneAndUpdate(
    { _id: new ObjectId(c.req.param('id')) },
    { $set: { status } },
    { returnDocument: 'after' },
  )
  if (!doc) return c.json({ error: 'Not found' }, 404)
  return c.json({ message: toAdmin(doc) })
})
