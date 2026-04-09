export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  S3_URL: process.env.NEXT_PUBLIC_S3_URL ?? 'http://localhost:9000/ecommerce-assets',
} as const
