import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

// Every failed check answers { error: '<first message>' }, the shape the frontend already reads.
export function validate<Target extends keyof ValidationTargets, T extends z.ZodType>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) return c.json({ error: result.error.issues[0]?.message ?? 'Invalid request' }, 400)
  })
}

export function objectId(message = 'Invalid id') {
  return z
    .string({ error: message })
    .refine((value) => ObjectId.isValid(value), message)
    .transform((value) => new ObjectId(value))
}

// A route id that is not an ObjectId cannot match anything, so it answers 404 like a missing record.
export function param<T extends z.ZodType>(schema: T) {
  return zValidator('param', schema, (result, c) => {
    if (!result.success) return c.json({ error: 'Not found' }, 404)
  })
}

export const idParam = param(z.object({ id: objectId() }))

export function required(message: string) {
  return z.string({ error: message }).trim().min(1, message)
}

export const email = z
  .string({ error: 'Invalid email' })
  .trim()
  .toLowerCase()
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email')

// Accepts a date string, or an empty value meaning "not set".
export function optionalDate(message: string) {
  return z
    .union([z.null(), z.literal(''), z.string().refine((value) => !Number.isNaN(Date.parse(value)))], { error: message })
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
}
