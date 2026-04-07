import slugifyLib from 'slugify'
import { prisma } from './prisma.js'

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

/**
 * Ensure slug is unique for a given model by appending -2, -3, etc.
 */
export async function ensureUniqueSlug(
  slug: string,
  model: 'product' | 'category',
  excludeId?: string,
): Promise<string> {
  let candidate = slug
  let counter = 1

  while (true) {
    const existing = await (prisma[model] as any).findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) return candidate

    counter++
    candidate = `${slug}-${counter}`
  }
}
