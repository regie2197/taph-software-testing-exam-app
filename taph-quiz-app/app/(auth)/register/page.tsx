import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <RegisterForm />
    </div>
  )
}