import 'dotenv/config'
import { closeDatabase, getDb } from './db.js'
import { ensureSchema } from './schema.js'

await ensureSchema(getDb())
console.log('Database schema is ready')
await closeDatabase()
