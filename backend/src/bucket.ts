import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'

// S3 client for backend
// This file contains the function to get the bucket name and the function to get the bucket client
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples-creating-buckets.html

let client: S3Client | undefined

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Set ${name}`)
  }
  return value
}

export function getBucketName(): string {
  return required('AWS_S3_BUCKET_NAME')
}

export function getBucket(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION || 'auto',
      endpoint: required('AWS_ENDPOINT_URL'),
      credentials: {
        accessKeyId: required('AWS_ACCESS_KEY_ID'),
        secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
      },
      // Railway buckets are S3-compatible and reject the SDK's default checksum headers.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }
  return client
}

export async function pingBucket(): Promise<void> {
  await getBucket().send(new HeadBucketCommand({ Bucket: getBucketName() }))
}
