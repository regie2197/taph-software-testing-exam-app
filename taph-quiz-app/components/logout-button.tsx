'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </button>
  )
}