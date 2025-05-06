import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'

export default function TopicsPage() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Available Topics
        </h3>
      </div>
      
      <Suspense fallback={
        <div className="mt-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      }>
        <TopicsList />
      </Suspense>
    </div>
  )
}

async function TopicsList() {
  const supabase = await createClient()
  
  // Get only published topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      description,
      created_at,
      created_by
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  if (topicsError) {
    console.error('Error fetching topics:', topicsError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading topics. Please refresh the page.
      </div>
    )
  }
  
  // Get question counts and creator info for each topic
  const topicsWithDetails = await Promise.all(
    (topics || []).map(async (topic) => {
      const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id)
      
      const { data: creator, error: creatorError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', topic.created_by)
        .single()
      
      return {
        ...topic,
        questionCount: countError ? 0 : count || 0,
        creatorName: creatorError ? 'Unknown' : creator?.full_name || 'Anonymous'
      }
    })
  )
  
  if (topicsWithDetails.length === 0) {
    return (
      <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No topics available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for new topics.
        </p>
      </div>
    )
  }
  
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topicsWithDetails.map((topic: any) => (
          <div key={topic.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div>
                <h3 className="text-lg font-medium text-gray-900 truncate">{topic.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  By {topic.creatorName}
                </p>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {topic.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  {topic.questionCount} question{topic.questionCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-5 py-3 text-sm">
              <Link
                href={`/topics/${topic.id}`}
                className="font-medium text-indigo-600 hover:text-indigo-900"
              >
                View Topic
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}