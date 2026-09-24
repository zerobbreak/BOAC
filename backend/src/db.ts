import { MongoClient, type Db } from 'mongodb'

// MongoDB client for backend
// This file contains the function to connect to the database and the functions to get the client and the database
// https://www.mongodb.com/docs/drivers/node/current/

let client: MongoClient | undefined

function connectionUri(): string {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URL
  if (!uri) {
    throw new Error('Set MONGODB_URI or MONGO_URL')
  }
  return uri
}

export function getClient(): MongoClient {
  if (!client) {
    // One long-running Hono process and low expected concurrency.
    // Driver defaults (maxPoolSize 100, minPoolSize 0) stay in place until traffic is measured.
    client = new MongoClient(connectionUri())
  }
  return client
}

export function getDb(): Db {
  return getClient().db(process.env.MONGODB_DB ?? 'boac')
}

export async function pingDatabase(): Promise<void> {
  await getClient().db().command({ ping: 1 })
}

export async function closeDatabase(): Promise<void> {
  if (!client) return
  await client.close()
  client = undefined
}
