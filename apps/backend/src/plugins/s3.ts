import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { s3Client, S3_BUCKET, ensureBucket, getPresignedUploadUrl, deleteObject, getPublicUrl } from '../lib/s3.js'
import type { S3Client } from '@aws-sdk/client-s3'

export type S3Helper = {
  client: S3Client
  bucket: string
  getPresignedUploadUrl: typeof getPresignedUploadUrl
  deleteObject: typeof deleteObject
  getPublicUrl: typeof getPublicUrl
}

declare module 'fastify' {
  interface FastifyInstance {
    s3: S3Helper
  }
}

export default fp(async function s3Plugin(fastify: FastifyInstance) {
  await ensureBucket()
  fastify.log.info(`S3 bucket "${S3_BUCKET}" ready`)

  fastify.decorate('s3', {
    client: s3Client,
    bucket: S3_BUCKET,
    getPresignedUploadUrl,
    deleteObject,
    getPublicUrl,
  })
})
