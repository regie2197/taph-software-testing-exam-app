'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
        //console.log('Looking up username:', data.identifier)
        
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', data.identifier)
          .single()
        
        if (profileError || !userProfile) {
          //console.error('Username lookup failed:', profileError)
          throw new Error('Username not found')
        }
        
        if (!userProfile.email) {
          throw new Error('Username found but no email associated')
        }
        
        // Use the email we found for login
        loginEmail = userProfile.email
        console.log('Found email for username:', loginEmail)
      }
      
      // Attempt login with the email
      //console.log('Attempting login with email:', loginEmail)
      const result = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      })
      
      if (result.error) {
        throw result.error
      }
      
      // Get user role after successful login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single()
      
      if (profileError) {
        //console.error('Error fetching role:', profileError)
        throw new Error('Could not determine user role')
      }
      
      // Redirect based on role
      if (profile.role === 'quiz_master') {
        router.push('/dashboard')
      } else {
        router.push('/topics')
      }
      
      router.refresh()
    } catch (err: any) {
      //console.error('Login error:', err)
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
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
          type="text"
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
          type="password"
          {...register('password')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </div>

      <div className="text-center">
        <Link href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
          Don't have an account? Register
        </Link>
      </div>
    </form>
  )
}