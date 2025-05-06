import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  
  // Sign out from Supabase auth
  await supabase.auth.signOut()
  
  // Clear all authentication cookies
  const cookieStore = await cookies()
  
  // Clear all Supabase cookies (these names may vary depending on your setup)
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    '__session'
  ]
  
  for (const name of cookiesToClear) {
    cookieStore.delete(name)
  }
  
  return NextResponse.json({ 
    success: true,
    message: 'Logged out successfully' 
  })
}