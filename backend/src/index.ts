import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { pingBucket } from './bucket.js'
import { closeDatabase, pingDatabase } from './db.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

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
})

async function shutdown() {
  server.close()
  await closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
