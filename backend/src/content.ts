import { Hono } from 'hono'
import { MongoServerError, ObjectId, type Filter } from 'mongodb'
import { auth, requireStaff, staffRole, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { deleteObject, putObject, readImage, readObject } from './storage.js'

const types = ['post', 'article'] as const
const statuses = ['draft', 'published'] as const
type ContentType = (typeof types)[number]
type ContentStatus = (typeof statuses)[number]

type ContentDoc = {
  _id: ObjectId
  type: ContentType
  title: string
  body: string
  status: ContentStatus
  authorId: ObjectId
  categoryId?: ObjectId
  tagIds?: ObjectId[]
  coverKey?: string
  createdAt: Date
  updatedAt: Date
}

type NameDoc = { _id: ObjectId; name: string }

function isType(value: unknown): value is ContentType {
  return value === 'post' || value === 'article'
}

function isStatus(value: unknown): value is ContentStatus {
  return value === 'draft' || value === 'published'
}

function readId(value: unknown): ObjectId | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    throw new Error('Invalid id')
  }
  return new ObjectId(value)
}

function readTagIds(value: unknown): ObjectId[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('Invalid tags')
  if (value.length > 20) throw new Error('A content item can have at most 20 tags')
  const ids = value.map((item) => readId(item))
  if (ids.some((id) => !id)) throw new Error('Invalid tags')
  return [...new Set(ids.map((id) => id!.toHexString()))].map((id) => new ObjectId(id))
}

function toContent(doc: ContentDoc, audience: 'public' | 'admin' = 'public') {
  const id = doc._id.toHexString()
  const coverUrl = !doc.coverKey
    ? null
    : audience === 'admin'
      ? `/admin/content/${id}/cover`
      : doc.status === 'published'
        ? `/content/${id}/cover`
        : null
  return {
    id,
    type: doc.type,
    title: doc.title,
    body: doc.body,
    status: doc.status,
    authorId: doc.authorId.toHexString(),
    categoryId: doc.categoryId?.toHexString() ?? null,
    tagIds: (doc.tagIds ?? []).map((tagId) => tagId.toHexString()),
    coverUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function toName(doc: NameDoc) {
  return { id: doc._id.toHexString(), name: doc.name }
}

async function canPublish(role: unknown): Promise<boolean> {
  const allowed = await auth.api.userHasPermission({
    body: { role: staffRole(role), permissions: { staff: ['publish_content'] } },
  })
  return allowed.success
}

async function nameExists(collection: 'categories' | 'tags', id: ObjectId): Promise<boolean> {
  const doc = await getDb().collection<NameDoc>(collection).findOne({ _id: id })
  return doc !== null
}

const names = new Hono()

names.get('/categories', async (c) => {
  const docs = await getDb().collection<NameDoc>('categories').find().sort({ name: 1 }).toArray()
  return c.json({ categories: docs.map(toName) })
})

names.get('/tags', async (c) => {
  const docs = await getDb().collection<NameDoc>('tags').find().sort({ name: 1 }).toArray()
  return c.json({ tags: docs.map(toName) })
})

const publicContent = new Hono()

publicContent.get('/', async (c) => {
  const filter: Filter<ContentDoc> = { status: 'published' }
  const type = c.req.query('type')
  if (type !== undefined) {
    if (!isType(type)) return c.json({ error: 'Invalid type' }, 400)
    filter.type = type
  }
  try {
    const categoryId = readId(c.req.query('categoryId'))
    const tagId = readId(c.req.query('tagId'))
    if (categoryId) filter.categoryId = categoryId
    if (tagId) filter.tagIds = tagId
  } catch {
    return c.json({ error: 'Invalid id' }, 400)
  }
  const docs = await getDb()
    .collection<ContentDoc>('content')
    .find(filter)
    .sort({ updatedAt: -1 })
    .toArray()
  return c.json({ content: docs.map((doc) => toContent(doc, 'public')) })
})

publicContent.get('/:id/cover', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ContentDoc>('content').findOne({
    _id: new ObjectId(c.req.param('id')),
    status: 'published',
  })
  if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
  const object = await readObject(doc.coverKey)
  if (!object) return c.json({ error: 'Not found' }, 404)
  return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
})

publicContent.get('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ContentDoc>('content').findOne({
    _id: new ObjectId(c.req.param('id')),
    status: 'published',
  })
  if (!doc) return c.json({ error: 'Not found' }, 404)
  return c.json({ content: toContent(doc) })
})

const dashboard = new Hono<AppEnv>()
dashboard.use('*', requireStaff('manage_content'))

function nameRoutes(collection: 'categories' | 'tags', label: string) {
  const route = new Hono<AppEnv>()
  route.use('*', requireStaff('manage_content'))

  route.get('/', async (c) => {
    const docs = await getDb().collection<NameDoc>(collection).find().sort({ name: 1 }).toArray()
    return c.json({ [collection]: docs.map(toName) })
  })

  route.post('/', async (c) => {
    const body = await c.req.json().catch(() => null)
    const name = body && typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return c.json({ error: 'Name is required' }, 400)
    try {
      const inserted = await getDb().collection<NameDoc>(collection).insertOne({ _id: new ObjectId(), name })
      return c.json({ [label]: { id: inserted.insertedId.toHexString(), name } }, 201)
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return c.json({ error: `${label} already exists` }, 409)
      }
      throw error
    }
  })

  route.patch('/:id', async (c) => {
    if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
    const body = await c.req.json().catch(() => null)
    const name = body && typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return c.json({ error: 'Name is required' }, 400)
    try {
      const doc = await getDb().collection<NameDoc>(collection).findOneAndUpdate(
        { _id: new ObjectId(c.req.param('id')) },
        { $set: { name } },
        { returnDocument: 'after' },
      )
      if (!doc) return c.json({ error: 'Not found' }, 404)
      return c.json({ [label]: toName(doc) })
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return c.json({ error: `${label} already exists` }, 409)
      }
      throw error
    }
  })

  route.delete('/:id', async (c) => {
    if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
    const result = await getDb().collection(collection).deleteOne({ _id: new ObjectId(c.req.param('id')) })
    if (result.deletedCount === 0) return c.json({ error: 'Not found' }, 404)
    return c.json({ ok: true })
  })

  return route
}

dashboard.get('/', async (c) => {
  const filter: Filter<ContentDoc> = {}
  const status = c.req.query('status')
  const type = c.req.query('type')
  if (status !== undefined) {
    if (!isStatus(status)) return c.json({ error: 'Invalid status' }, 400)
    filter.status = status
  }
  if (type !== undefined) {
    if (!isType(type)) return c.json({ error: 'Invalid type' }, 400)
    filter.type = type
  }
  const docs = await getDb().collection<ContentDoc>('content').find(filter).sort({ updatedAt: -1 }).toArray()
  return c.json({ content: docs.map((doc) => toContent(doc, 'admin')) })
})

dashboard.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const title = body && typeof body.title === 'string' ? body.title.trim() : ''
  const contentType = body?.type ?? 'post'
  const bodyText = body && typeof body.body === 'string' ? body.body : ''
  const status: ContentStatus = body?.status ?? 'draft'
  if (!title) return c.json({ error: 'Title is required' }, 400)
  if (!isType(contentType)) return c.json({ error: 'Invalid type' }, 400)
  if (!isStatus(status)) return c.json({ error: 'Invalid status' }, 400)
  if (status === 'published' && !(await canPublish(c.get('user').role))) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (!ObjectId.isValid(c.get('user').id)) return c.json({ error: 'Invalid author' }, 400)

  let categoryId: ObjectId | undefined
  let tagIds: ObjectId[] | undefined
  try {
    categoryId = readId(body?.categoryId)
    tagIds = readTagIds(body?.tagIds)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid id' }, 400)
  }
  if (categoryId && !(await nameExists('categories', categoryId))) {
    return c.json({ error: 'Category not found' }, 400)
  }
  if (tagIds) {
    const found = await getDb().collection('tags').countDocuments({ _id: { $in: tagIds } })
    if (found !== tagIds.length) return c.json({ error: 'Tag not found' }, 400)
  }

  const now = new Date()
  const doc: ContentDoc = {
    _id: new ObjectId(),
    type: contentType,
    title,
    body: bodyText,
    status,
    authorId: new ObjectId(c.get('user').id),
    createdAt: now,
    updatedAt: now,
  }
  if (categoryId) doc.categoryId = categoryId
  if (tagIds) doc.tagIds = tagIds
  await getDb().collection<ContentDoc>('content').insertOne(doc)
  return c.json({ content: toContent(doc, 'admin') }, 201)
})

dashboard.patch('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'No changes' }, 400)

  const update: Partial<ContentDoc> = {}
  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (!title) return c.json({ error: 'Title is required' }, 400)
    update.title = title
  }
  if (body.type !== undefined) {
    if (!isType(body.type)) return c.json({ error: 'Invalid type' }, 400)
    update.type = body.type
  }
  if (typeof body.body === 'string') update.body = body.body
  if (body.status !== undefined) {
    if (!isStatus(body.status)) return c.json({ error: 'Invalid status' }, 400)
    if (!(await canPublish(c.get('user').role))) return c.json({ error: 'Forbidden' }, 403)
    update.status = body.status
  }
  try {
    if (body.categoryId !== undefined) {
      const categoryId = readId(body.categoryId)
      if (categoryId && !(await nameExists('categories', categoryId))) {
        return c.json({ error: 'Category not found' }, 400)
      }
      update.categoryId = categoryId
    }
    if (body.tagIds !== undefined) {
      const tagIds = readTagIds(body.tagIds) ?? []
      const found = await getDb().collection('tags').countDocuments({ _id: { $in: tagIds } })
      if (found !== tagIds.length) return c.json({ error: 'Tag not found' }, 400)
      update.tagIds = tagIds
    }
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid id' }, 400)
  }
  if (Object.keys(update).length === 0) return c.json({ error: 'No changes' }, 400)

  update.updatedAt = new Date()
  const unset: Record<string, ''> = {}
  if (body.categoryId === null || body.categoryId === '') unset.categoryId = ''
  const operators: { $set: Partial<ContentDoc>; $unset?: Record<string, ''> } = { $set: update }
  if (body.categoryId === null || body.categoryId === '') {
    delete update.categoryId
    operators.$unset = unset
  }
  const doc = await getDb().collection<ContentDoc>('content').findOneAndUpdate(
    { _id: new ObjectId(c.req.param('id')) },
    operators,
    { returnDocument: 'after' },
  )
  if (!doc) return c.json({ error: 'Not found' }, 404)
  return c.json({ content: toContent(doc, 'admin') })
})

dashboard.post('/:id/cover', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.parseBody()
  const existing = await getDb().collection<ContentDoc>('content').findOne({
    _id: new ObjectId(c.req.param('id')),
  })
  if (!existing) return c.json({ error: 'Not found' }, 404)
  let image: { bytes: Uint8Array; type: string }
  try {
    image = await readImage(body.cover ?? body.image)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid image' }, 400)
  }
  const key = `content/${existing._id.toHexString()}/cover`
  await putObject(key, image.bytes, image.type)
  if (existing.coverKey && existing.coverKey !== key) await deleteObject(existing.coverKey)
  const doc = await getDb().collection<ContentDoc>('content').findOneAndUpdate(
    { _id: existing._id },
    { $set: { coverKey: key, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return c.json({ content: toContent(doc ?? { ...existing, coverKey: key }, 'admin') })
})

dashboard.get('/:id/cover', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ContentDoc>('content').findOne({
    _id: new ObjectId(c.req.param('id')),
  })
  if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
  const object = await readObject(doc.coverKey)
  if (!object) return c.json({ error: 'Not found' }, 404)
  return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
})

dashboard.delete('/:id/cover', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ContentDoc>('content').findOne({
    _id: new ObjectId(c.req.param('id')),
  })
  if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
  await deleteObject(doc.coverKey)
  await getDb().collection<ContentDoc>('content').updateOne(
    { _id: doc._id },
    { $unset: { coverKey: '' }, $set: { updatedAt: new Date() } },
  )
  return c.json({ ok: true })
})

dashboard.delete('/:id', async (c) => {
  if (!ObjectId.isValid(c.req.param('id'))) return c.json({ error: 'Not found' }, 404)
  const doc = await getDb().collection<ContentDoc>('content').findOneAndDelete({
    _id: new ObjectId(c.req.param('id')),
  })
  if (!doc) return c.json({ error: 'Not found' }, 404)
  if (doc.coverKey) await deleteObject(doc.coverKey)
  return c.json({ ok: true })
})

export const publicRoutes = new Hono()
publicRoutes.route('/content', publicContent)
publicRoutes.route('/', names)

export const categoryRoutes = nameRoutes('categories', 'category')
export const tagRoutes = nameRoutes('tags', 'tag')
export const contentRoutes = dashboard
