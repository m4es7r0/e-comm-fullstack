export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Build a full image URL from a path that is either an S3 key or an absolute URL */
export function getImageUrl(path: string | undefined | null, s3BaseUrl: string, fallback = '/placeholder-product.svg'): string {
  if (!path) return fallback
  // Already an absolute URL — use as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // S3 key — prepend bucket URL
  return `${s3BaseUrl}/${path}`
}

/** Strip undefined/null/empty values from an object and convert to Record<string, string> for use as URL search params */
export function toSearchParams(params?: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  if (!params) return result
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = String(value)
    }
  }
  return result
}
