import { apiUrl } from './auth'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
    throw new ApiError(response.status, payload?.error || payload?.message || response.statusText)
  }
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return undefined as T
  return response.json() as Promise<T>
}

export async function apiBlob(path: string): Promise<string> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(response.status, 'File could not be loaded')
  return URL.createObjectURL(await response.blob())
}
