import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui'
import { RegisterForm } from '@/features/auth'
import { ROUTES } from '@/shared/config'

export const metadata = {
  title: 'Sign Up',
}

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Enter your details to create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={ROUTES.login} className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
