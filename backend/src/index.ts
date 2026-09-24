import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {
  clearSessionCookie,
  ensureAdminUser,
  issueSession,
  login,
  requireAuth,
  writeSessionCookie,
  type AppEnv,
} from './auth.js'
import { pingBucket } from './bucket.js'
import { closeDatabase, getDb, pingDatabase } from './db.js'

const app = new Hono<AppEnv>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const email = body && typeof body.email === 'string' ? body.email : ''
  const password = body && typeof body.password === 'string' ? body.password : ''
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  const user = await login(email, password)
  if (!user) return c.json({ error: 'Invalid email or password' }, 401)

  const token = await issueSession(user)
  writeSessionCookie(c, token)
  return c.json({ token, user })
})

app.post('/auth/logout', (c) => {
  clearSessionCookie(c)
  return c.json({ ok: true })
})

app.get('/auth/me', requireAuth, (c) => {
  return c.json({ user: c.get('user') })
})

const admin = new Hono<AppEnv>()
admin.use('*', requireAuth)
admin.get('/', (c) => c.json({ ok: true, user: c.get('user') }))
app.route('/admin', admin)

app.get('/health', async (c) => {
  const checks = await Promise.allSettled([pingDatabase(), pingBucket()])
  const database = checks[0].status === 'fulfilled'
  const bucket = checks[1].status === 'fulfilled'
  return c.json({ database, bucket }, database && bucket ? 200 : 503)
})

const port = Number(process.env.PORT) || 3000

const server = serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
  ensureAdminUser(getDb()).catch((error: unknown) => {
    console.error('Admin user setup failed', error)
  })
})

async function shutdown() {
  server.close()
  await closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
