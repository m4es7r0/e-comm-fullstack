import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui'
import { LoginForm } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export const metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.register} className="text-primary underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
