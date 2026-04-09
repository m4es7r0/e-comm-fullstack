import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const PresignRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().refine((ct) => ALLOWED_TYPES.includes(ct), {
    message: `Content type must be one of: ${ALLOWED_TYPES.join(', ')}`,
  }),
})

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  // ── POST /upload/presign ──────────────────────────────────────────
  // Get a presigned URL for direct client-to-S3 upload
  fastify.post(
    '/upload/presign',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { filename, contentType } = PresignRequestSchema.parse(request.body)

      // Generate unique key: images/2026/04/uuid.ext
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const ext = filename.split('.').pop() ?? 'bin'
      const key = `images/${year}/${month}/${randomUUID()}.${ext}`

      const uploadUrl = await fastify.s3.getPresignedUploadUrl(key, contentType, MAX_SIZE)
      const publicUrl = fastify.s3.getPublicUrl(key)

      return reply.send({
        data: { key, uploadUrl, publicUrl },
      })
    },
  )

  // ── DELETE /upload/:key (admin) ───────────────────────────────────
  fastify.delete<{ Params: { key: string } }>(
    '/upload/:key',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const key = decodeURIComponent(request.params.key)
      await fastify.s3.deleteObject(key)
      return reply.status(204).send()
    },
  )
}

export default uploadRoutes
