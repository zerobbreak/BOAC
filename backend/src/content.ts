import { Hono } from 'hono'
import { MongoServerError, ObjectId, type Filter } from 'mongodb'
import { z } from 'zod'
import { auth, requireStaff, staffRole, type AppEnv } from './auth.js'
import { getDb } from './db.js'
import { deleteObject, putObject, readImage, readObject } from './storage.js'
import { idParam, objectId, required, validate } from './validate.js'

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

type Named = { id: string; name: string }

function toName(doc: NameDoc): Named {
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

async function tagsExist(tagIds: ObjectId[]): Promise<boolean> {
  const found = await getDb().collection('tags').countDocuments({ _id: { $in: tagIds } })
  return found === tagIds.length
}

const type = z.enum(types, { error: 'Invalid type' })
const status = z.enum(statuses, { error: 'Invalid status' })

// An empty id in a query or body means "no filter" or "no category".
const optionalId = z
  .union([z.null(), z.literal(''), objectId()], { error: 'Invalid id' })
  .optional()
const tagIds = z
  .array(objectId('Invalid tags'), { error: 'Invalid tags' })
  .max(20, 'A content item can have at most 20 tags')
  .transform((ids) => [...new Set(ids.map((id) => id.toHexString()))].map((id) => new ObjectId(id)))
  .optional()

const publicQuery = z.object({ type: type.optional(), categoryId: optionalId, tagId: optionalId })
const adminQuery = z.object({ status: status.optional(), type: type.optional() })
const createSchema = z.object({
  title: required('Title is required'),
  type: type.default('post'),
  body: z.string().default(''),
  status: status.default('draft'),
  categoryId: optionalId,
  tagIds,
})
const updateSchema = z.object({
  title: required('Title is required').optional(),
  type: type.optional(),
  body: z.string().optional(),
  status: status.optional(),
  categoryId: optionalId,
  tagIds,
})
const coverForm = z.object({
  cover: z.instanceof(File, { error: 'Image is required' }).optional(),
  image: z.instanceof(File, { error: 'Image is required' }).optional(),
})
const nameSchema = z.object({ name: required('Name is required') })

const names = new Hono()
  .get('/categories', async (c) => {
    const docs = await getDb().collection<NameDoc>('categories').find().sort({ name: 1 }).toArray()
    return c.json({ categories: docs.map(toName) })
  })
  .get('/tags', async (c) => {
    const docs = await getDb().collection<NameDoc>('tags').find().sort({ name: 1 }).toArray()
    return c.json({ tags: docs.map(toName) })
  })

const publicContent = new Hono()
  .get('/', validate('query', publicQuery), async (c) => {
    const query = c.req.valid('query')
    const filter: Filter<ContentDoc> = { status: 'published' }
    if (query.type) filter.type = query.type
    if (query.categoryId) filter.categoryId = query.categoryId
    if (query.tagId) filter.tagIds = query.tagId
    const docs = await getDb()
      .collection<ContentDoc>('content')
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray()
    return c.json({ content: docs.map((doc) => toContent(doc, 'public')) })
  })
  .get('/:id/cover', idParam, async (c) => {
    const doc = await getDb().collection<ContentDoc>('content').findOne({
      _id: c.req.valid('param').id,
      status: 'published',
    })
    if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
    const object = await readObject(doc.coverKey)
    if (!object) return c.json({ error: 'Not found' }, 404)
    return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
  })
  .get('/:id', idParam, async (c) => {
    const doc = await getDb().collection<ContentDoc>('content').findOne({
      _id: c.req.valid('param').id,
      status: 'published',
    })
    if (!doc) return c.json({ error: 'Not found' }, 404)
    return c.json({ content: toContent(doc) })
  })

function nameRoutes<Collection extends 'categories' | 'tags', Label extends string>(collection: Collection, label: Label) {
  return new Hono<AppEnv>()
    .use('*', requireStaff('manage_content'))
    .get('/', async (c) => {
      const docs = await getDb().collection<NameDoc>(collection).find().sort({ name: 1 }).toArray()
      return c.json({ [collection]: docs.map(toName) } as Record<Collection, Named[]>)
    })
    .post('/', validate('json', nameSchema), async (c) => {
      const { name } = c.req.valid('json')
      try {
        const inserted = await getDb().collection<NameDoc>(collection).insertOne({ _id: new ObjectId(), name })
        return c.json({ [label]: { id: inserted.insertedId.toHexString(), name } } as Record<Label, Named>, 201)
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          return c.json({ error: `${label} already exists` }, 409)
        }
        throw error
      }
    })
    .patch('/:id', idParam, validate('json', nameSchema), async (c) => {
      const { name } = c.req.valid('json')
      try {
        const doc = await getDb().collection<NameDoc>(collection).findOneAndUpdate(
          { _id: c.req.valid('param').id },
          { $set: { name } },
          { returnDocument: 'after' },
        )
        if (!doc) return c.json({ error: 'Not found' }, 404)
        return c.json({ [label]: toName(doc) } as Record<Label, Named>)
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          return c.json({ error: `${label} already exists` }, 409)
        }
        throw error
      }
    })
    .delete('/:id', idParam, async (c) => {
      const result = await getDb().collection(collection).deleteOne({ _id: c.req.valid('param').id })
      if (result.deletedCount === 0) return c.json({ error: 'Not found' }, 404)
      return c.json({ ok: true })
    })
}

const dashboard = new Hono<AppEnv>()
  .use('*', requireStaff('manage_content'))
  .get('/', validate('query', adminQuery), async (c) => {
    const query = c.req.valid('query')
    const filter: Filter<ContentDoc> = {}
    if (query.status) filter.status = query.status
    if (query.type) filter.type = query.type
    const docs = await getDb().collection<ContentDoc>('content').find(filter).sort({ updatedAt: -1 }).toArray()
    return c.json({ content: docs.map((doc) => toContent(doc, 'admin')) })
  })
  .post('/', validate('json', createSchema), async (c) => {
    const body = c.req.valid('json')
    if (body.status === 'published' && !(await canPublish(c.get('user').role))) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    if (!ObjectId.isValid(c.get('user').id)) return c.json({ error: 'Invalid author' }, 400)
    if (body.categoryId && !(await nameExists('categories', body.categoryId))) {
      return c.json({ error: 'Category not found' }, 400)
    }
    if (body.tagIds && !(await tagsExist(body.tagIds))) return c.json({ error: 'Tag not found' }, 400)

    const now = new Date()
    const doc: ContentDoc = {
      _id: new ObjectId(),
      type: body.type,
      title: body.title,
      body: body.body,
      status: body.status,
      authorId: new ObjectId(c.get('user').id),
      createdAt: now,
      updatedAt: now,
    }
    if (body.categoryId) doc.categoryId = body.categoryId
    if (body.tagIds) doc.tagIds = body.tagIds
    await getDb().collection<ContentDoc>('content').insertOne(doc)
    return c.json({ content: toContent(doc, 'admin') }, 201)
  })
  .patch('/:id', idParam, validate('json', updateSchema), async (c) => {
    const body = c.req.valid('json')
    const update: Partial<ContentDoc> = {}
    if (body.title !== undefined) update.title = body.title
    if (body.type !== undefined) update.type = body.type
    if (body.body !== undefined) update.body = body.body
    if (body.status !== undefined) {
      if (!(await canPublish(c.get('user').role))) return c.json({ error: 'Forbidden' }, 403)
      update.status = body.status
    }
    if (body.categoryId) {
      if (!(await nameExists('categories', body.categoryId))) return c.json({ error: 'Category not found' }, 400)
      update.categoryId = body.categoryId
    }
    if (body.tagIds !== undefined) {
      if (!(await tagsExist(body.tagIds))) return c.json({ error: 'Tag not found' }, 400)
      update.tagIds = body.tagIds
    }
    const clearCategory = body.categoryId === null || body.categoryId === ''
    if (Object.keys(update).length === 0 && !clearCategory) return c.json({ error: 'No changes' }, 400)

    update.updatedAt = new Date()
    const operators: { $set: Partial<ContentDoc>; $unset?: Record<string, ''> } = { $set: update }
    if (clearCategory) operators.$unset = { categoryId: '' }
    const doc = await getDb().collection<ContentDoc>('content').findOneAndUpdate(
      { _id: c.req.valid('param').id },
      operators,
      { returnDocument: 'after' },
    )
    if (!doc) return c.json({ error: 'Not found' }, 404)
    return c.json({ content: toContent(doc, 'admin') })
  })
  .post('/:id/cover', idParam, validate('form', coverForm), async (c) => {
    const body = c.req.valid('form')
    const existing = await getDb().collection<ContentDoc>('content').findOne({ _id: c.req.valid('param').id })
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
  .get('/:id/cover', idParam, async (c) => {
    const doc = await getDb().collection<ContentDoc>('content').findOne({ _id: c.req.valid('param').id })
    if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
    const object = await readObject(doc.coverKey)
    if (!object) return c.json({ error: 'Not found' }, 404)
    return c.body(Buffer.from(object.body), 200, { 'content-type': object.type })
  })
  .delete('/:id/cover', idParam, async (c) => {
    const doc = await getDb().collection<ContentDoc>('content').findOne({ _id: c.req.valid('param').id })
    if (!doc?.coverKey) return c.json({ error: 'Not found' }, 404)
    await deleteObject(doc.coverKey)
    await getDb().collection<ContentDoc>('content').updateOne(
      { _id: doc._id },
      { $unset: { coverKey: '' }, $set: { updatedAt: new Date() } },
    )
    return c.json({ ok: true })
  })
  .delete('/:id', idParam, async (c) => {
    const doc = await getDb().collection<ContentDoc>('content').findOneAndDelete({ _id: c.req.valid('param').id })
    if (!doc) return c.json({ error: 'Not found' }, 404)
    if (doc.coverKey) await deleteObject(doc.coverKey)
    return c.json({ ok: true })
  })

export const publicRoutes = new Hono().route('/content', publicContent).route('/', names)

export const categoryRoutes = nameRoutes('categories', 'category')
export const tagRoutes = nameRoutes('tags', 'tag')
export const contentRoutes = dashboard
