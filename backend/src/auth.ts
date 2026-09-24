import { createMiddleware } from 'hono/factory'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { ObjectId, type Db } from 'mongodb'
import { getDb } from './db.js'
import { hashPassword, verifyPassword } from './passwords.js'
import type { Permission } from './schema.js'

const SESSION_SECONDS = 60 * 60 * 12
const COOKIE = 'session'

export type AuthUser = {
  id: string
  email: string
  role: string
  permissions: Permission[]
}

export type AppEnv = {
  Variables: {
    user: AuthUser
  }
}

type UserDoc = {
  _id: ObjectId
  email: string
  passHash: string
  roleId: ObjectId
}

type RoleDoc = {
  _id: ObjectId
  name: string
  permissions: Permission[]
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('Set JWT_SECRET to at least 32 characters')
  }
  return secret
}

function publicUser(user: UserDoc, role: RoleDoc): AuthUser {
  return {
    id: user._id.toHexString(),
    email: user.email,
    role: role.name,
    permissions: role.permissions,
  }
}

async function loadUser(db: Db, id: string): Promise<AuthUser | undefined> {
  if (!ObjectId.isValid(id)) return undefined
  const user = await db.collection<UserDoc>('users').findOne({ _id: new ObjectId(id) })
  if (!user) return undefined
  const role = await db.collection<RoleDoc>('roles').findOne({ _id: user.roleId })
  if (!role) return undefined
  return publicUser(user, role)
}

export async function login(email: string, password: string): Promise<AuthUser | undefined> {
  const db = getDb()
  const user = await db.collection<UserDoc>('users').findOne({
    email: email.trim().toLowerCase(),
  })
  if (!user || !(await verifyPassword(password, user.passHash))) return undefined
  const role = await db.collection<RoleDoc>('roles').findOne({ _id: user.roleId })
  if (!role || role.name !== 'admin') return undefined
  return publicUser(user, role)
}

export async function issueSession(user: AuthUser): Promise<string> {
  return sign(
    {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    },
    jwtSecret(),
  )
}

export function writeSessionCookie(c: Parameters<typeof setCookie>[0], token: string): void {
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export function clearSessionCookie(c: Parameters<typeof deleteCookie>[0]): void {
  deleteCookie(c, COOKIE, { path: '/' })
}

function readToken(c: Parameters<typeof getCookie>[0]): string | undefined {
  const header = c.req.header('Authorization')
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length)
  return getCookie(c, COOKIE)
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = readToken(c)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const payload = await verify(token, jwtSecret(), 'HS256')
    const sub = payload.sub
    if (typeof sub !== 'string') return c.json({ error: 'Unauthorized' }, 401)
    const user = await loadUser(getDb(), sub)
    if (!user || user.role !== 'admin') return c.json({ error: 'Unauthorized' }, 401)
    c.set('user', user)
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})

export async function ensureAdminUser(db: Db): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.log('ADMIN_EMAIL and ADMIN_PASSWORD are unset; admin user was not created')
    return
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters')
  }

  const existing = await db.collection<UserDoc>('users').findOne({ email })
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    return
  }

  const role = await db.collection<RoleDoc>('roles').findOne({ name: 'admin' })
  if (!role) throw new Error('admin role is missing; run schema setup first')

  await db.collection('users').insertOne({
    email,
    passHash: await hashPassword(password),
    roleId: role._id,
  })
  console.log(`Admin user created: ${email}`)
}
