import type { Metadata } from 'next'
import { Providers } from './providers'
import './global.css'
import { Geist } from 'next/font/google'
import { cn } from '@/shared/lib/cn'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'E-Commerce Store',
    template: '%s | E-Commerce Store',
  },
  description: 'Modern fullstack e-commerce store',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
