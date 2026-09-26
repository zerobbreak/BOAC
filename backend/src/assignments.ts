import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { requireAdmin, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { objectId, optionalDate, validate } from './validate.js'

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

const assignSchema = z.object({
  volunteerId: objectId('Volunteer and opportunity are required'),
  opportunityId: objectId('Volunteer and opportunity are required'),
  startsAt: optionalDate('Invalid start time'),
})

export const assignmentRoutes = new Hono<AppEnv>()
  .use('*', requireAdmin)
  .post('/', validate('json', assignSchema), async (c) => {
    const { volunteerId, opportunityId, startsAt } = c.req.valid('json')
    const volunteer = await getDb().collection<UserDoc>('user').findOne({ _id: volunteerId })
    if (!volunteer || volunteer.role !== 'volunteer') {
      return c.json({ error: 'Volunteer not found' }, 404)
    }
    const opportunity = await getDb().collection<OpportunityDoc>('opportunities').findOne({ _id: opportunityId })
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
