'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'quiz_master'] as const)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user' // Default role
    }
  })
  
  const selectedRole = watch('role')
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            role: data.role
          },
        }
      })
      
      if (authError) throw authError
      
      // Create profile entry (this may be handled by a database trigger, but ensuring it exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user?.id,
          username: data.username,
          email: data.email,
          role: data.role
        })
      
      if (profileError) throw profileError
      
      // Show success message and redirect to login page after a short delay
      setSuccess('Registration successful! Redirecting to login page...')
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded" role="status">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          {...register('username')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              id="role-user"
              type="radio"
              value="user"
              {...register('role')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="role-user" className="ml-2 block text-sm text-gray-700">
              Regular User
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="role-quiz-master"
              type="radio"
              value="quiz_master"
              {...register('role')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="role-quiz-master" className="ml-2 block text-sm text-gray-700">
              Quiz Master
            </label>
          </div>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.role.message}</p>
        )}
        
        {selectedRole === 'quiz_master' && (
          <p className="mt-2 text-xs text-gray-500">
            As a Quiz Master, you'll be able to create and manage topics and questions.
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      <div className="text-center">
        <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
          Already have an account? Log in
        </Link>
      </div>
    </form>
  )
}