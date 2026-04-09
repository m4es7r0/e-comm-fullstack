import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const S3_ENDPOINT = process.env.S3_ENDPOINT ?? 'http://localhost:9000'
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ?? 'minioadmin'
const S3_SECRET_KEY = process.env.S3_SECRET_KEY ?? 'minioadmin'
const S3_REGION = process.env.S3_REGION ?? 'us-east-1'

export const S3_BUCKET = process.env.S3_BUCKET ?? 'ecommerce-assets'

export const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
})

/**
 * Generate a presigned PUT URL for direct client upload.
 * Expires in 5 minutes.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 5 * 1024 * 1024, // 5MB default
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 300 })
}

/**
 * Delete an object from S3.
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Get the public URL for an uploaded object.
 */
export function getPublicUrl(key: string): string {
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`
}

/**
 * Ensure the bucket exists, create if it doesn't.
 */
export async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }))
  }
}
