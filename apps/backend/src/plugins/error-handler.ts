import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import type { ApiErrorBody } from '@ecomm/contracts'

export default fp(async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: Error & { statusCode?: number }, _request: FastifyRequest, reply: FastifyReply) => {
      const body: ApiErrorBody = {
        message: 'Internal Server Error',
        status: 500,
      }

      // ── Fastify validation / known HTTP errors ──────────────────
      if (error.statusCode) {
        body.status = error.statusCode
        body.message = error.message
        body.code = `HTTP_${error.statusCode}`
      }

      // ── Zod validation errors ───────────────────────────────────
      if (error instanceof ZodError) {
        body.status = 400
        body.code = 'VALIDATION_ERROR'
        body.message = 'Validation failed'
        body.details = {
          issues: error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        }
      }

      // ── Prisma errors ───────────────────────────────────────────
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': {
            // Unique constraint violation
            const target = (error.meta?.target as string[]) ?? []
            body.status = 409
            body.code = 'UNIQUE_CONSTRAINT'
            body.message = `A record with this ${target.join(', ')} already exists`
            break
          }
          case 'P2025': {
            // Record not found
            body.status = 404
            body.code = 'NOT_FOUND'
            body.message = 'Record not found'
            break
          }
          case 'P2003': {
            // Foreign key constraint
            body.status = 400
            body.code = 'FOREIGN_KEY_CONSTRAINT'
            body.message = 'Referenced record does not exist'
            break
          }
          default: {
            body.status = 500
            body.code = `PRISMA_${error.code}`
            body.message = 'Database error'
          }
        }
      }

      // ── Log server errors ───────────────────────────────────────
      if ((body.status ?? 500) >= 500) {
        fastify.log.error(error)
      }

      return reply.status(body.status ?? 500).send(body)
    },
  )
})
