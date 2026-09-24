import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth, ensureAdminUser, frontendOrigin, requireAdmin, type AppEnv } from './auth.js'
import { pingBucket } from './bucket.js'
import { closeDatabase, pingDatabase } from './db.js'

const app = new Hono<AppEnv>()

app.use(
  '*',
  cors({
    origin: frontendOrigin,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const admin = new Hono<AppEnv>()
admin.use('*', requireAdmin)
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
  ensureAdminUser().catch((error: unknown) => {
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
