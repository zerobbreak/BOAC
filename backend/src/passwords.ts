import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  return `scrypt$${salt}$${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !parts[1] || !parts[2]) {
    return false
  }
  const expected = Buffer.from(parts[2], 'hex')
  const actual = (await scryptAsync(password, parts[1], KEY_LEN)) as Buffer
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}
