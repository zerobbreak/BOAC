import { hc, type ClientResponse } from 'hono/client'
import type { SuccessStatusCode } from 'hono/utils/http-status'
import type { AppType } from '../../../backend/src/index'
import { apiUrl } from './auth'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Typed from the backend's route chain: a renamed route or field fails the frontend build.
export const client = hc<AppType>(apiUrl, { init: { credentials: 'include' } })

type Success<R> = R extends ClientResponse<infer T, infer S, any> ? (S extends SuccessStatusCode ? T : never) : never

// Resolves to the success body, or throws ApiError with the server's { error } message.
export async function unwrap<R extends ClientResponse<unknown, number, any>>(request: Promise<R>): Promise<Success<R>> {
  const response = await request
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
    throw new ApiError(response.status, payload?.error || payload?.message || response.statusText)
  }
  return response.json() as Promise<Success<R>>
}

export async function apiBlob(path: string): Promise<string> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(response.status, 'File could not be loaded')
  return URL.createObjectURL(await response.blob())
}

export function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
