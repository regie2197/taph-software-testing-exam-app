import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Log in to your account
      </h2>
      <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
      </Suspense>
    </div>
  )
}