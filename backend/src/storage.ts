import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getBucket, getBucketName } from './bucket.js'

const MAX_BYTES = 5 * 1024 * 1024

// Checks the file's magic bytes rather than trusting its name or MIME type: JPEG FF D8 FF, PNG 89 50 4E 47,
// WebP "RIFF" + "WEBP" at offset 8 (Wikipedia, 2026).
// <https://en.wikipedia.org/wiki/List_of_file_signatures> [Accessed 4 October 2026]. Full reference in README.md.
export function imageType(bytes: Uint8Array): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return undefined
}

export async function readImage(file: unknown): Promise<{ bytes: Uint8Array; type: string }> {
  if (!(file instanceof File)) throw new Error('Image is required')
  if (file.size > MAX_BYTES) throw new Error('Image must be 5 MB or smaller')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = imageType(bytes)
  if (!type) throw new Error('Image must be JPEG, PNG, or WebP')
  return { bytes, type }
}

// Adapted from Amazon Web Services ([s.a.]a): PutObject, DeleteObject and GetObject commands; Body.transformToByteArray.
// <https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html> [Accessed 4 October 2026].
export async function putObject(key: string, bytes: Uint8Array, type: string): Promise<void> {
  await getBucket().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: bytes,
      ContentType: type,
    }),
  )
}

export async function deleteObject(key: string): Promise<void> {
  await getBucket().send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }))
}

export async function readObject(key: string): Promise<{ body: Uint8Array; type: string } | undefined> {
  try {
    const result = await getBucket().send(new GetObjectCommand({ Bucket: getBucketName(), Key: key }))
    if (!result.Body) return undefined
    return {
      body: await result.Body.transformToByteArray(),
      type: result.ContentType ?? 'application/octet-stream',
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error) {
      const name = String(error.name)
      if (name === 'NoSuchKey' || name === 'NotFound') return undefined
    }
    throw error
  }
}
