import 'dotenv/config'
import { ensureAdminUser, ensureVolunteerUser } from './auth.js'
import { closeDatabase, getDb } from './db.js'
import { ensureSchema } from './schema.js'

// One-off setup run by `npm run db:setup`: applies the $jsonSchema validators and indexes from schema.ts
// (MongoDB, [s.a.]c; MongoDB, [s.a.]d), creates the seed users, then closes the client (MongoDB, [s.a.]b).
// Full references in README.md.
const db = getDb()
await ensureSchema(db)
await ensureAdminUser()
await ensureVolunteerUser()
console.log('Database schema is ready')
await closeDatabase()
