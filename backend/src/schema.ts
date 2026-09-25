import type { Db } from 'mongodb'

export const permissions = [
  'manage_content',
  'publish_content',
  'manage_opportunities',
  'review_applications',
  'manage_users',
  'track_work',
] as const

export type Permission = (typeof permissions)[number]

const objectId = { bsonType: 'objectId' } as const
const email = {
  bsonType: 'string',
  pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
} as const

function collectionSchema(
  required: string[],
  properties: Record<string, unknown>,
) {
  return {
    $jsonSchema: {
      bsonType: 'object',
      additionalProperties: false,
      required,
      properties: {
        _id: objectId,
        ...properties,
      },
    },
  }
}

export const validators = {
  roles: collectionSchema(['name', 'permissions'], {
    name: { bsonType: 'string', minLength: 1 },
    permissions: {
      bsonType: 'array',
      uniqueItems: true,
      maxItems: permissions.length,
      items: { enum: [...permissions] },
    },
  }),
  users: collectionSchema(['email', 'passHash', 'roleId'], {
    email,
    passHash: { bsonType: 'string', minLength: 1 },
    roleId: objectId,
  }),
  categories: collectionSchema(['name'], {
    name: { bsonType: 'string', minLength: 1 },
  }),
  tags: collectionSchema(['name'], {
    name: { bsonType: 'string', minLength: 1 },
  }),
  content: collectionSchema(
    ['type', 'title', 'body', 'status', 'authorId', 'createdAt', 'updatedAt'],
    {
      type: { enum: ['post', 'article'] },
      title: { bsonType: 'string', minLength: 1 },
      body: { bsonType: 'string' },
      status: { enum: ['draft', 'published'] },
      authorId: objectId,
      categoryId: objectId,
      tagIds: {
        bsonType: 'array',
        uniqueItems: true,
        maxItems: 20,
        items: objectId,
      },
      coverKey: { bsonType: 'string', minLength: 1 },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  ),
  opportunities: collectionSchema(
    ['title', 'status', 'public', 'createdAt', 'updatedAt'],
    {
      title: { bsonType: 'string', minLength: 1 },
      status: { enum: ['open', 'closed'] },
      public: { bsonType: 'bool' },
      location: { bsonType: 'string' },
      closingDate: { bsonType: 'date' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  ),
  volunteer_work: collectionSchema(
    ['volunteerId', 'title', 'status', 'createdAt', 'updatedAt'],
    {
      volunteerId: objectId,
      title: { bsonType: 'string', minLength: 1 },
      status: { enum: ['planned', 'in_progress', 'done'] },
      notes: { bsonType: 'string' },
      opportunityId: objectId,
      startsAt: { bsonType: 'date' },
      hours: { bsonType: ['double', 'int'], minimum: 0 },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  ),
  volunteer_applications: collectionSchema(
    ['opportunityId', 'fullName', 'email', 'status', 'submittedAt'],
    {
      opportunityId: objectId,
      fullName: { bsonType: 'string', minLength: 1 },
      email,
      phone: { bsonType: 'string' },
      status: { enum: ['submitted', 'under_review', 'needs_info', 'declined', 'accepted'] },
      internalNotes: { bsonType: 'string' },
      fileKeys: {
        bsonType: 'array',
        uniqueItems: true,
        maxItems: 3,
        items: { bsonType: 'string', minLength: 1 },
      },
      reviewedBy: objectId,
      submittedAt: { bsonType: 'date' },
    },
  ),
} as const

export type CollectionName = keyof typeof validators

const indexes: Record<
  CollectionName,
  Array<{ key: Record<string, 1 | -1>; unique?: boolean; partialFilterExpression?: Record<string, unknown> }>
> = {
  roles: [{ key: { name: 1 }, unique: true }],
  users: [{ key: { email: 1 }, unique: true }],
  categories: [{ key: { name: 1 }, unique: true }],
  tags: [{ key: { name: 1 }, unique: true }],
  content: [
    { key: { status: 1, type: 1 } },
    { key: { status: 1, categoryId: 1 } },
    { key: { tagIds: 1 } },
    { key: { authorId: 1 } },
  ],
  opportunities: [{ key: { public: 1, status: 1 } }],
  volunteer_applications: [
    { key: { opportunityId: 1 } },
    { key: { status: 1 } },
    {
      key: { email: 1, opportunityId: 1 },
      unique: true,
      partialFilterExpression: {
        status: { $in: ['submitted', 'under_review', 'needs_info', 'accepted'] },
      },
    },
  ],
  volunteer_work: [
    { key: { volunteerId: 1, updatedAt: -1 } },
    { key: { volunteerId: 1, startsAt: 1 } },
  ],
}

const seedRoles: Array<{ name: string; permissions: Permission[] }> = [
  { name: 'admin', permissions: [...permissions] },
  { name: 'editor', permissions: ['manage_content', 'publish_content'] },
  { name: 'reviewer', permissions: ['manage_opportunities', 'review_applications'] },
  { name: 'volunteer', permissions: ['track_work'] },
]

async function ensureCollection(db: Db, name: CollectionName): Promise<void> {
  const validator = validators[name]
  const exists = await db.listCollections({ name }).hasNext()
  if (!exists) {
    await db.createCollection(name, {
      validator,
      validationLevel: 'strict',
      validationAction: 'error',
    })
  } else {
    if (name === 'volunteer_applications') {
      await db.collection(name).updateMany({ status: 'contacted' }, { $set: { status: 'under_review' } })
    }
    await db.command({
      collMod: name,
      validator,
      validationLevel: 'strict',
      validationAction: 'error',
    })
  }

  for (const index of indexes[name]) {
    await db.collection(name).createIndex(index.key, {
      unique: index.unique ?? false,
      ...(index.partialFilterExpression
        ? { partialFilterExpression: index.partialFilterExpression }
        : {}),
    })
  }
}

export async function ensureSchema(db: Db): Promise<void> {
  for (const name of Object.keys(validators) as CollectionName[]) {
    await ensureCollection(db, name)
  }

  for (const role of seedRoles) {
    await db.collection('roles').updateOne(
      { name: role.name },
      { $set: { permissions: role.permissions }, $setOnInsert: { name: role.name } },
      { upsert: true },
    )
  }
}
