import { createClient } from '@/lib/supabase/server'
import {  notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function TopicDetailsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ topicId: string }>,
  searchParams: Promise<{ preview?: string }>
}) {
  const { topicId } = await params
  const { preview } = await searchParams
  const isPreview = preview === 'true'
  
  return (
    <div>
      <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-md"></div>}>
        <TopicDetails topicId={topicId} isPreview={isPreview} />
      </Suspense>
    </div>
  )
}

async function TopicDetails({ topicId, isPreview }: { topicId: string, isPreview: boolean }) {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get topic details
  const { data: topic, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  
  if (error || !topic) {
    notFound()
  }
  
  // For preview mode, check if user is quiz master and topic owner
  let canViewDraft = false
  
  if (isPreview && user) {
    // If it's preview mode, check if the user is the owner and a quiz master
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    canViewDraft = profile?.role === 'quiz_master' && topic.created_by === user.id
  }
  
  // If the topic is not published and user can't view drafts, return 404
  if (!topic.is_published && !canViewDraft) {
    notFound()
  }
  
  // Get question count
  const { count, error: countError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', topicId)
  
  // Get creator details
  const { data: creator, error: creatorError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', topic.created_by)
    .single()
  
  return (
    <div>
      {isPreview && canViewDraft && (
        <div className="mb-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-700 font-medium">
            Preview Mode {!topic.is_published && "- This topic is currently a draft and not visible to students"}
          </p>
          <div className="mt-2">
            <Link href={`/manage-topics/${topicId}/edit`} className="text-sm text-indigo-600 hover:text-indigo-900">
              Edit this topic
            </Link>
            <span className="mx-2 text-gray-300">|</span>
            <Link href={`/manage-questions/${topicId}`} className="text-sm text-indigo-600 hover:text-indigo-900">
              Manage questions
            </Link>
          </div>
        </div>
      )}
      
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {topic.title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Created by {creatorError ? 'Unknown' : creator?.username || 'Anonymous'}
        </p>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Topic Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details about this topic.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{topic.description || 'No description provided.'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Number of Questions</dt>
              <dd className="mt-1 text-sm text-gray-900">{countError ? 'Unknown' : count || 0}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(topic.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Only show quiz button if the topic is published or we're not in preview mode */}
        {(topic.is_published || !isPreview) && (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="sm:flex sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Ready to test your knowledge?
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Start a quiz on this topic to test your understanding.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                {!user ? (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Login to Take Quiz
                  </Link>
                ) : (
                  <Link
                    href={`/topics/${topicId}/quiz`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start Quiz
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}