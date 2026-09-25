import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'

type UserDoc = {
  _id: ObjectId
  email: string
  name: string
  role?: string
}

type OpportunityDoc = {
  _id: ObjectId
  title: string
  location?: string
}

export const assignmentRoutes = new Hono<AppEnv>()
assignmentRoutes.use('*', requireAdmin)

assignmentRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const volunteerId = body && typeof body.volunteerId === 'string' ? body.volunteerId : ''
  const opportunityId = body && typeof body.opportunityId === 'string' ? body.opportunityId : ''
  if (!ObjectId.isValid(volunteerId) || !ObjectId.isValid(opportunityId)) {
    return c.json({ error: 'Volunteer and opportunity are required' }, 400)
  }

  let startsAt: Date | undefined
  if (body.startsAt !== undefined && body.startsAt !== null && body.startsAt !== '') {
    if (typeof body.startsAt !== 'string' || Number.isNaN(Date.parse(body.startsAt))) {
      return c.json({ error: 'Invalid start time' }, 400)
    }
    startsAt = new Date(body.startsAt)
  }

  const volunteer = await getDb().collection<UserDoc>('user').findOne({ _id: new ObjectId(volunteerId) })
  if (!volunteer || volunteer.role !== 'volunteer') {
    return c.json({ error: 'Volunteer not found' }, 404)
  }
  const opportunity = await getDb().collection<OpportunityDoc>('opportunities').findOne({
    _id: new ObjectId(opportunityId),
  })
  if (!opportunity) return c.json({ error: 'Opportunity not found' }, 404)

  const now = new Date()
  const doc = {
    _id: new ObjectId(),
    volunteerId: volunteer._id,
    title: opportunity.title,
    status: 'planned' as const,
    opportunityId: opportunity._id,
    createdAt: now,
    updatedAt: now,
    ...(startsAt ? { startsAt } : {}),
  }
  await getDb().collection('volunteer_work').insertOne(doc)
  return c.json({
    assignment: {
      id: doc._id.toHexString(),
      volunteerId: volunteer._id.toHexString(),
      title: doc.title,
      status: doc.status,
      opportunityId: opportunity._id.toHexString(),
      opportunityTitle: opportunity.title,
      location: opportunity.location ?? null,
      startsAt: startsAt ?? null,
    },
  }, 201)
})
