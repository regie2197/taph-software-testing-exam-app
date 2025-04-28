import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export function createClient() {
  const cookieStorePromise = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookieStore = await cookieStorePromise
          return cookieStore.get(name)?.value
        },
        async set(name, value, options) {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value, ...options })
        },
        async remove(name, options) {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}