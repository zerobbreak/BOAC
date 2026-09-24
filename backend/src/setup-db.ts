import 'dotenv/config'
import { ensureAdminUser } from './auth.js'
import { closeDatabase, getDb } from './db.js'
import { ensureSchema } from './schema.js'

const db = getDb()
await ensureSchema(db)
await ensureAdminUser(db)
console.log('Database schema is ready')
await closeDatabase()
