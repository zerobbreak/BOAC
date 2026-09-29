import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { auth, ensureAdminUser, ensureVolunteerUser, frontendOrigin, requireAdmin, type AppEnv } from './auth.js'
import { pingBucket } from './bucket.js'
import { closeDatabase, pingDatabase } from './db.js'
import { applicationRoutes, publicApplications } from './applications.js'
import { assignmentRoutes } from './assignments.js'
import { messageRoutes, publicContact } from './contact.js'
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

// Malformed JSON or form bodies surface here; answer in the same { error } shape as the routes.
app.onError((error, c) => {
  if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const admin = new Hono<AppEnv>()
  .use('*', requireAdmin)
  .get('/', (c) => c.json({ ok: true, user: c.get('user') }))
  .route('/content', contentRoutes)
  .route('/categories', categoryRoutes)
  .route('/tags', tagRoutes)
  .route('/opportunities', opportunityRoutes)
  .route('/applications', applicationRoutes)
  .route('/assignments', assignmentRoutes)
  .route('/messages', messageRoutes)

// The frontend's typed client is built from this chain, so every API route belongs in it.
const routes = app
  .route('/admin', admin)
  .route('/opportunities', publicOpportunities)
  .route('/applications', publicApplications)
  .route('/contact', publicContact)
  .route('/', publicRoutes)
  .route('/volunteer', volunteer)

export type AppType = typeof routes

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
