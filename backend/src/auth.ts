import { betterAuth } from 'better-auth'
import { mongodbAdapter } from '@better-auth/mongo-adapter'
import { admin as adminPlugin } from 'better-auth/plugins'
import { createMiddleware } from 'hono/factory'
import { getClient, getDb } from './db.js'
import { ac, roles } from './permissions.js'

export const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.JWT_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  trustedOrigins: [frontendOrigin],
  database: mongodbAdapter(getDb(), { client: getClient() }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    adminPlugin({
      ac,
      roles,
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
})

type Session = typeof auth.$Infer.Session

export type AppEnv = {
  Variables: {
    user: Session['user']
    session: Session['session']
  }
}

function hasRole(role: unknown, expected: string): boolean {
  if (role === expected) return true
  if (Array.isArray(role)) return role.includes(expected)
  if (typeof role === 'string') {
    return role.split(',').map((part) => part.trim()).includes(expected)
  }
  return false
}

function requireRole(expected: 'admin' | 'volunteer') {
  return createMiddleware<AppEnv>(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)
    if (!hasRole(session.user.role, expected)) return c.json({ error: 'Forbidden' }, 403)
    c.set('user', session.user)
    c.set('session', session.session)
    await next()
  })
}

export const requireAdmin = requireRole('admin')
export const requireVolunteer = requireRole('volunteer')

export async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.log('ADMIN_EMAIL and ADMIN_PASSWORD are unset; admin user was not created')
    return
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters')
  }

  const ctx = await auth.$context
  const existing = await ctx.adapter.findOne({
    model: 'user',
    where: [{ field: 'email', value: email }],
  })
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    return
  }

  const created = await ctx.internalAdapter.createUser(
    {
      email,
      name: 'Admin',
      role: 'admin',
      emailVerified: true,
    },
    { method: 'email-password' },
  )
  if (!created) throw new Error('Failed to create admin user')

  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: await ctx.password.hash(password),
  })
  console.log(`Admin user created: ${email}`)
}

export async function ensureVolunteerUser(): Promise<void> {
  const email = process.env.VOLUNTEER_EMAIL?.trim().toLowerCase()
  const password = process.env.VOLUNTEER_PASSWORD
  if (!email || !password) {
    console.log('VOLUNTEER_EMAIL and VOLUNTEER_PASSWORD are unset; volunteer user was not created')
    return
  }
  if (password.length < 8) {
    throw new Error('VOLUNTEER_PASSWORD must be at least 8 characters')
  }

  const ctx = await auth.$context
  const existing = await ctx.adapter.findOne({
    model: 'user',
    where: [{ field: 'email', value: email }],
  })
  if (existing) {
    console.log(`Volunteer user already exists: ${email}`)
    return
  }

  const created = await ctx.internalAdapter.createUser(
    {
      email,
      name: 'Volunteer',
      role: 'volunteer',
      emailVerified: true,
    },
    { method: 'email-password' },
  )
  if (!created) throw new Error('Failed to create volunteer user')

  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: await ctx.password.hash(password),
  })
  console.log(`Volunteer user created: ${email}`)
}
