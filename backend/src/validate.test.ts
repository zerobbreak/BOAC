import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { email, objectId, optionalDate, required, validate } from './validate.js'

// Adapted from Vitest ([s.a.]): vi.hoisted creates the mocks that the vi.mock factories below use.
// <https://vitest.dev/api/vi.html> [Accessed 4 October 2026]. Full reference in README.md.
const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(),
  userHasPermission: vi.fn(),
}))

const mockDb = vi.hoisted(() => ({
  collections: {} as Record<string, any>,
  volunteerWork: [] as any[],
}))

vi.mock('./db.js', () => ({
  getDb: () => ({
    collection: (name: string) => mockDb.collections[name] ?? {
      find: () => ({ sort: () => ({ toArray: async () => [] }) }),
      insertOne: async () => ({ insertedId: new ObjectId() }),
      findOne: async () => null,
      findOneAndUpdate: async () => null,
      updateOne: async () => ({ matchedCount: 0 }),
      deleteOne: async () => ({ deletedCount: 0 }),
    },
  }),
}))

vi.mock('./auth.js', () => {
  const staffRole = (role: unknown): 'admin' | 'editor' | 'reviewer' | 'user' | 'volunteer' => {
    if (typeof role === 'string' && ['admin', 'editor', 'reviewer', 'user', 'volunteer'].includes(role)) {
      return role as 'admin' | 'editor' | 'reviewer' | 'user' | 'volunteer'
    }
    return 'user'
  }

  const requireRole = (expected: 'admin' | 'volunteer') => async (c: any, next: () => Promise<void>) => {
    const session = await mockAuth.getSession()
    if (!session) return c.json({ error: 'Unauthorized' }, 401)
    if (session.user.role !== expected) return c.json({ error: 'Forbidden' }, 403)
    c.set('user', session.user)
    c.set('session', session.session)
    await next()
  }

  const requireStaff = (action: 'manage_content' | 'publish_content') => async (c: any, next: () => Promise<void>) => {
    const session = await mockAuth.getSession()
    if (!session) return c.json({ error: 'Unauthorized' }, 401)
    const allowed = await mockAuth.userHasPermission({
      body: { role: staffRole(session.user.role), permissions: { staff: [action] } },
    })
    if (!allowed.success) return c.json({ error: 'Forbidden' }, 403)
    c.set('user', session.user)
    c.set('session', session.session)
    await next()
  }

  return {
    auth: { api: { getSession: mockAuth.getSession, userHasPermission: mockAuth.userHasPermission } },
    requireAdmin: requireRole('admin'),
    requireVolunteer: requireRole('volunteer'),
    requireStaff,
    staffRole,
  }
})

import { requireAdmin, requireStaff, requireVolunteer, staffRole } from './auth.js'
import { applicationRoutes } from './applications.js'
import { publicContact } from './contact.js'
import volunteer from './volunteer-work.js'

describe('backend validation helpers', () => {
  it('accepts valid values that the API expects', () => {
    expect(required('Name is required').parse('Alice')).toBe('Alice')
    expect(email.parse('User.Name@example.com')).toBe('user.name@example.com')
    expect(objectId().parse('507f1f77bcf86cd799439011')).toBeInstanceOf(ObjectId)
    expect(optionalDate('Invalid date').parse('2026-09-30T12:00:00.000Z')).toBeInstanceOf(Date)
    expect(optionalDate('Invalid date').parse('')).toBeUndefined()
    expect(optionalDate('Invalid date').parse(null)).toBeUndefined()
  })

  it('rejects invalid values that should fail validation', () => {
    expect(() => required('Name is required').parse('')).toThrow()
    expect(() => email.parse('not-an-email')).toThrow()
    expect(() => objectId().parse('not-a-real-object-id')).toThrow()
    expect(() => optionalDate('Invalid date').parse('not-a-date')).toThrow()
  })

  it('returns the proper validation error payload shape', () => {
    const middleware = validate('json', required('Name is required'))
    expect(typeof middleware).toBe('function')
  })
})

describe('staff role mapping', () => {
  it('accepts known staff roles and falls back for unknown values', () => {
    expect(staffRole('admin')).toBe('admin')
    expect(staffRole('editor')).toBe('editor')
    expect(staffRole('reviewer')).toBe('reviewer')
    expect(staffRole('volunteer')).toBe('volunteer')
    expect(staffRole('unknown-role')).toBe('user')
    expect(staffRole(undefined)).toBe('user')
  })
})

describe('middleware checks', () => {
  beforeEach(() => {
    mockAuth.getSession.mockReset()
    mockAuth.userHasPermission.mockReset()
  })

  it('allows an admin through the admin middleware', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      session: { id: 's1' },
    })

    const app = new Hono().use('*', requireAdmin).get('/secret', (c) => c.json({ ok: true }))
    const response = await app.request('http://localhost/secret')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('blocks non-admin users from the admin middleware', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: 'user-1', role: 'user', email: 'user@example.com' },
      session: { id: 's2' },
    })

    const app = new Hono().use('*', requireAdmin).get('/secret', (c) => c.json({ ok: true }))
    const response = await app.request('http://localhost/secret')

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
  })

  it('checks volunteer permission for volunteer routes', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: 'vol-1', role: 'volunteer', email: 'vol@example.com' },
      session: { id: 's3' },
    })

    const app = new Hono().use('*', requireVolunteer).get('/vol', (c) => c.json({ ok: true }))
    const response = await app.request('http://localhost/vol')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('enforces staff permissions when required', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: 'staff-1', role: 'editor', email: 'staff@example.com' },
      session: { id: 's4' },
    })
    mockAuth.userHasPermission.mockResolvedValue({ success: true })

    const app = new Hono().use('*', requireStaff('manage_content')).get('/content', (c) => c.json({ ok: true }))
    const response = await app.request('http://localhost/content')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(mockAuth.userHasPermission).toHaveBeenCalled()
  })
})

describe('public and admin route behavior', () => {
  beforeEach(() => {
    mockAuth.getSession.mockReset()
    mockAuth.userHasPermission.mockReset()
    mockDb.collections.contact_messages = {
      insertOne: vi.fn(async () => ({ insertedId: new ObjectId() })),
    }
    mockDb.collections.volunteer_applications = {
      find: () => ({
        sort: () => ({
          toArray: async () => [{
            _id: new ObjectId('507f1f77bcf86cd799439011'),
            opportunityId: new ObjectId('507f1f77bcf86cd799439012'),
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            status: 'submitted',
            submittedAt: new Date('2026-09-30T10:00:00Z'),
          }],
        }),
      }),
    }
    mockDb.volunteerWork = [
      {
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        volunteerId: new ObjectId('507f1f77bcf86cd799439010'),
        title: 'Garden Shift',
        status: 'planned',
        notes: 'Bring gloves',
        opportunityId: new ObjectId('507f1f77bcf86cd799439012'),
        startsAt: new Date('2026-10-05T09:00:00Z'),
        createdAt: new Date('2026-09-28T09:00:00Z'),
        updatedAt: new Date('2026-09-29T09:00:00Z'),
      },
      {
        _id: new ObjectId('507f1f77bcf86cd799439014'),
        volunteerId: new ObjectId('507f1f77bcf86cd799439010'),
        title: 'Finished Shift',
        status: 'done',
        notes: 'Completed',
        opportunityId: new ObjectId('507f1f77bcf86cd799439012'),
        createdAt: new Date('2026-09-20T09:00:00Z'),
        updatedAt: new Date('2026-09-21T09:00:00Z'),
      },
    ]
    mockDb.collections.volunteer_work = {
      find: vi.fn((filter: any) => ({
        toArray: async () => mockDb.volunteerWork.filter((item) => item.volunteerId.equals(filter.volunteerId)),
      })),
      insertOne: vi.fn(async (doc) => {
        mockDb.volunteerWork.push(doc)
        return { insertedId: doc._id }
      }),
      findOneAndUpdate: vi.fn(async (_filter: any, _update: any) => {
        const item = mockDb.volunteerWork.find((entry) => entry._id.equals(_filter._id))
        if (!item) return null
        item.status = _update.$set.status ?? item.status
        item.notes = _update.$set.notes ?? item.notes
        item.hours = _update.$set.hours ?? item.hours
        item.updatedAt = _update.$set.updatedAt ?? item.updatedAt
        return item
      }),
    }
    mockDb.collections.opportunities = {
      find: vi.fn(() => ({
        toArray: async () => [{
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          title: 'Community Garden',
          location: 'North Hall',
        }],
      })),
    }
  })

  it('accepts a valid public contact form request', async () => {
    const response = await publicContact.request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'general',
        message: 'Hello there',
      }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ message: { id: expect.any(String) } })
  })

  it('rejects invalid public contact payloads', async () => {
    const response = await publicContact.request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jane@example.com' }),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Name, email, and message are required' })
  })

  it('lists protected applications for an admin user', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      session: { id: 's1' },
    })

    const response = await applicationRoutes.request('http://localhost/?status=submitted')

    expect(response.status).toBe(200)
    const payload = await response.json() as { applications: any[] }
    expect(payload.applications).toHaveLength(1)
    expect(payload.applications[0]).toMatchObject({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      status: 'submitted',
    })
  })

  it('loads the volunteer dashboard for their own work', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439010', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
      session: { id: 's-vol' },
    })

    const response = await volunteer.request('http://localhost/dashboard')

    expect(response.status).toBe(200)
    const payload = await response.json() as { profile: any; schedule: any; spaces: any[] }
    expect(payload.profile.email).toBe('jane@example.com')
    expect(payload.schedule.upcoming).toHaveLength(1)
    expect(payload.spaces[0].name).toBe('North Hall')
  })

  it('creates a new volunteer work entry', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439010', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
      session: { id: 's-vol' },
    })

    const response = await volunteer.request('http://localhost/work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Shift', status: 'planned', notes: 'Bring water' }),
    })

    expect(response.status).toBe(201)
    const payload = await response.json() as { work: any }
    expect(payload.work.title).toBe('New Shift')
    expect(payload.work.status).toBe('planned')
  })

  it('updates an existing volunteer work item', async () => {
    mockAuth.getSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439010', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
      session: { id: 's-vol' },
    })

    const response = await volunteer.request('http://localhost/work/507f1f77bcf86cd799439013', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress', notes: 'Updated note', hours: 2 }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json() as { work: any }
    expect(payload.work.status).toBe('in_progress')
    expect(payload.work.hours).toBe(2)
  })
})
