'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username'),
  password: z.string().min(1, 'Please enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const errorType = searchParams.get('error')
  const supabase = createClient()

  // Display error message from URL params (from middleware)
  useEffect(() => {
    if (errorType === 'session_expired') {
      setError('Your session has expired. Please log in again.')
    } else if (errorType === 'auth_error') {
      setError('There was a problem with authentication. Please log in again.')
    }
  }, [errorType])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true)
      setError(null)

      // Check if the identifier is an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isEmail = emailRegex.test(data.identifier)

      let loginEmail = data.identifier

      // If it's not an email, treat it as a username and look up the email
      if (!isEmail) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', data.identifier)
          .single()

        if (profileError || !userProfile) {
          throw new Error('Invalid username or password')
        }

        if (!userProfile.email) {
          throw new Error('Account configuration issue. Please contact support.')
        }

        // Use the email we found for login
        loginEmail = userProfile.email
      }

      // Attempt login with the email
      const result = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      })

      if (result.error) {
        // Use a generic message for security
        throw new Error('Invalid username/email or password')
      }

      // Get user role after successful login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single()

      if (profileError) {
        throw new Error('Error loading user profile')
      }

      // Honor the redirect parameter if it exists, otherwise use role-based redirect
      if (redirectPath && redirectPath !== '/dashboard') {
        router.push(redirectPath)
      } else {
        // Role-based default redirect
        if (profile.role === 'quiz_master') {
          router.push('/manage-topics')
        } else {
          router.push('/topics')
        }
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Access your quiz dashboard and track your progress
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
            Email or Username
          </label>
          <input
            id="identifier"
            data-testid="input-username"
            type="text"
            autoComplete="username"
            {...register('identifier')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            data-testid="input-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <div className="flex justify-between">

            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 mt-2">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            data-testid="login-button"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </div>

        <div className="text-center">
          <Link href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  )
}