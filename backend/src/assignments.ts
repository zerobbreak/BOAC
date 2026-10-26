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

type WorkDoc = {
  _id: ObjectId
  volunteerId: ObjectId
  title: string
  status: 'planned' | 'in_progress' | 'done'
  opportunityId?: ObjectId
  startsAt?: Date
  hours?: number
}

const assignSchema = z.object({
  volunteerId: objectId('Volunteer and opportunity are required'),
  opportunityId: objectId('Volunteer and opportunity are required'),
  startsAt: optionalDate('Invalid start time'),
})

// Adapted from Hono ([s.a.]a): one Hono instance per resource, routes chained so index.ts mounts it with
// app.route() and the frontend client infers its types. Bodies are checked with validate() (Hono, [s.a.]b).
// <https://hono.dev/docs/guides/best-practices> [Accessed 4 October 2026]. Full references in README.md.
export const assignmentRoutes = new Hono<AppEnv>()
  .use('*', requireAdmin)
  // Every volunteer's work with names and places filled in, soonest first; work with no start time goes last.
  .get('/', async (c) => {
    const docs = await getDb().collection<WorkDoc>('volunteer_work').find().toArray()
    const [people, opportunities] = await Promise.all([
      getDb().collection<UserDoc>('user').find({ _id: { $in: [...new Set(docs.map((doc) => doc.volunteerId))] } }).toArray(),
      getDb().collection<OpportunityDoc>('opportunities')
        .find({ _id: { $in: docs.flatMap((doc) => (doc.opportunityId ? [doc.opportunityId] : [])) } })
        .toArray(),
    ])
    const personById = new Map(people.map((person) => [person._id.toHexString(), person]))
    const opportunityById = new Map(opportunities.map((item) => [item._id.toHexString(), item]))
    const assignments = docs
      .map((doc) => {
        const person = personById.get(doc.volunteerId.toHexString())
        const opportunity = doc.opportunityId ? opportunityById.get(doc.opportunityId.toHexString()) : undefined
        return {
          id: doc._id.toHexString(),
          volunteerId: doc.volunteerId.toHexString(),
          volunteerName: person?.name ?? 'Former volunteer',
          title: doc.title,
          status: doc.status,
          opportunityId: doc.opportunityId?.toHexString() ?? null,
          location: opportunity?.location ?? null,
          startsAt: doc.startsAt ?? null,
          hours: doc.hours ?? null,
        }
      })
      .sort((a, b) => {
        if (!a.startsAt) return 1
        if (!b.startsAt) return -1
        return a.startsAt.getTime() - b.startsAt.getTime()
      })
    return c.json({ assignments })
  })
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
