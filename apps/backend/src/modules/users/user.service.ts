import type { PrismaClient } from '@prisma/client'
import type {
  PublicUser,
  UpdateProfileInput,
  ChangePasswordInput,
  PaginationParams,
  PaginatedResponse,
} from '@ecomm/contracts'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { paginateQuery, buildPaginationMeta } from '../../lib/pagination.js'

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    })
    return this.toPublic(user)
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: input,
    })
    return this.toPublic(user)
  }

  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { passwordHash: true },
    })

    const valid = await verifyPassword(input.currentPassword, user.passwordHash)
    if (!valid) {
      const error = new Error('Current password is incorrect') as Error & { statusCode: number }
      error.statusCode = 400
      throw error
    }

    const newHash = await hashPassword(input.newPassword)
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    })
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<PublicUser>> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        ...paginateQuery(params),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ])

    return {
      data: users.map(this.toPublic),
      meta: buildPaginationMeta(total, params),
    }
  }

  private toPublic(user: any): PublicUser {
    const { passwordHash: _, ...publicUser } = user
    return publicUser
  }
}
