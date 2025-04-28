import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Navigation() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isQuizMaster = profile?.role === 'quiz_master'
  
  return (
    <nav className="flex space-x-4">
      <Link 
        href="/dashboard" 
        className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
      >
        Dashboard
      </Link>
      
      {/* Only show Browse Topics to non-Quiz Masters */}
      {!isQuizMaster && (
        <Link 
          href="/topics" 
          className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
        >
          Browse Topics
        </Link>
      )}
      
      {/* Quiz Master specific navigation */}
      {isQuizMaster && (
        <>
          <Link 
            href="/manage-topics" 
            className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
          >
            Manage Topics
          </Link>
          
          <Link 
            href="/manage-questions" 
            className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
          >
            Manage Questions
          </Link>
        </>
      )}
    </nav>
  )
}