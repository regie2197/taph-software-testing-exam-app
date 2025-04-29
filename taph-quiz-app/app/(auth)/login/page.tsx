import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
      </Suspense>
    </div>
  )
}