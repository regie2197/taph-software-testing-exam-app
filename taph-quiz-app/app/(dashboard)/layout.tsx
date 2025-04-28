import { Navigation } from '@/components/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import LogoutButton from '@/components/logout-button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  TAPH Quiz App
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Suspense fallback={<nav className="flex space-x-4">
                  <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                </nav>}>
                  <Navigation />
                </Suspense>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Suspense fallback={<div className="h-8 w-36 bg-gray-200 rounded-md animate-pulse"></div>}>
                <ProfileSection />
              </Suspense>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

async function ProfileSection() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="flex space-x-4">
        <Link 
          href="/login" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Log in
        </Link>
        <Link 
          href="/signup" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Sign up
        </Link>
      </div>
    )
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img
            className="h-8 w-8 rounded-full"
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user.email}`}
            alt="Profile"
          />
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-700">
            {profile?.username || profile?.full_name || user.email}
          </div>
        </div>
      </div>
      <LogoutButton />
    </div>
  )
}