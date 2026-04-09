import Link from 'next/link'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { Button } from '@/shared/ui'
import { ROUTES } from '@/shared/config'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to E-Shop
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our curated collection of premium products. From electronics to fashion,
              find everything you need in one place.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href={ROUTES.catalog}>
                <Button size="lg">Browse catalog</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
