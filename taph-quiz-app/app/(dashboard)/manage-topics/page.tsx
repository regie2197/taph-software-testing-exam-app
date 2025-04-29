import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

export default function ManageTopicsPage() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Manage Topics
        </h3>
        <Link
          href="/manage-topics/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Create New Topic
        </Link>
      </div>

      <Suspense fallback={<TopicsListSkeleton />}>
        <TopicsList />
      </Suspense>
    </div>
  )
}

function TopicsListSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white shadow rounded-lg h-64 animate-pulse">
          <div className="h-full p-6 flex flex-col">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="h-20 bg-gray-100 rounded w-full mb-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            <div className="h-8 bg-gray-100 rounded w-full mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function TopicsList() {
  const supabase = createClient()

  // Check if user is authenticated and is a quiz master
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'quiz_master') {
    redirect('/dashboard')
  }

  // Get topics created by this quiz master
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      description,
      created_at,
      is_published
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (topicsError) {
    console.error('Error fetching topics:', topicsError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading topics. Please refresh the page.
      </div>
    )
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No topics found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first topic.
        </p>
        <div className="mt-6">
          <Link
            href="/manage-topics/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Topic
          </Link>
        </div>
      </div>
    )
  }

  // Get question counts for each topic efficiently (in parallel)
  const topicsWithDetails = await Promise.all(
    topics.map(async (topic) => {
      const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id)

      return {
        ...topic,
        questionCount: countError ? 0 : count || 0
      }
    })
  )

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {topicsWithDetails.map((topic) => (
        <div key={topic.id} className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900 truncate">{topic.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${topic.is_published
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {topic.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {topic.description || 'No description available.'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {topic.questionCount} question{topic.questionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            <div className="flex space-x-4">
              <Link
                href={`/manage-questions/${topic.id}`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Manage Questions
              </Link>
              <Link
                href={`/topics/${topic.id}?preview=true`}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Preview
              </Link>
            </div>
            <Link
              href={`/manage-topics/${topic.id}/edit`}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Edit Topic
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}