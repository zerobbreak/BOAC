import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth, ensureAdminUser, ensureVolunteerUser, frontendOrigin, requireAdmin, type AppEnv } from './auth.js'
import { pingBucket } from './bucket.js'
import { closeDatabase, pingDatabase } from './db.js'
import { applicationRoutes, publicApplications } from './applications.js'
import { assignmentRoutes } from './assignments.js'
import { categoryRoutes, contentRoutes, publicRoutes, tagRoutes } from './content.js'
import { opportunityRoutes, publicOpportunities } from './opportunities.js'
import volunteer from './volunteer-work.js'

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
admin.route('/content', contentRoutes)
admin.route('/categories', categoryRoutes)
admin.route('/tags', tagRoutes)
admin.route('/opportunities', opportunityRoutes)
admin.route('/applications', applicationRoutes)
admin.route('/assignments', assignmentRoutes)
app.route('/admin', admin)
app.route('/opportunities', publicOpportunities)
app.route('/applications', publicApplications)
app.route('/', publicRoutes)
app.route('/volunteer', volunteer)

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
  Promise.all([ensureAdminUser(), ensureVolunteerUser()]).catch((error: unknown) => {
    console.error('User setup failed', error)
  })
})

async function shutdown() {
  server.close()
  await closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
