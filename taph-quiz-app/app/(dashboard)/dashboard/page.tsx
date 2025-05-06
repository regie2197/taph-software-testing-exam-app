import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { Topic } from '@/types'

export default function Dashboard() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dashboard
        </h3>
      </div>
      
      <Suspense fallback={
        <div className="mt-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading user data. Please try refreshing the page.
      </div>
    )
  }
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading profile data. Please try refreshing the page.
      </div>
    )
  }
  
  const isQuizMaster = profile?.role === 'quiz_master'
  
  if (isQuizMaster) {
    return <QuizMasterDashboard userId={user.id} />
  } else {
    return <UserDashboard userId={user.id} />
  }
}

async function QuizMasterDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  // Get topics created by quiz master
  const { data: createdTopics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  
  if (topicsError) {
    console.error('Error fetching topics:', topicsError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading topics. Please try refreshing the page.
      </div>
    )
  }
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900">Your Topics</h4>
        <Link 
          href="/manage-topics/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Create New Topic
        </Link>
      </div>
      
      {createdTopics && createdTopics.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {createdTopics.map((topic: Topic) => (
            <div key={topic.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900">{topic.title}</h4>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{topic.description || 'No description'}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    topic.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {topic.is_published ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex space-x-3">
                    <Link 
                      href={`/topics/${topic.id}/questions`} 
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Questions
                    </Link>
                    <Link 
                      href={`/topics/${topic.id}/edit`} 
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't created any topics yet.</p>
          <Link 
            href="/create-topic" 
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-900"
          >
            Create your first topic
          </Link>
        </div>
      )}
    </div>
  )
}

async function UserDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  // Get recent quiz attempts for regular users
  const { data: recentAttempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      score,
      total_questions,
      completed_at,
      time_spent,
      topics (
        id,
        title
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5)
  
  if (attemptsError) {
    console.error('Error fetching attempts:', attemptsError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading quiz attempts. Please try refreshing the page.
      </div>
    )
  }
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900">Recent Quiz Results</h4>
        <Link 
          href="/topics" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Take a Quiz
        </Link>
      </div>
      
      {recentAttempts && recentAttempts.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentAttempts.map((attempt: any) => (
              <li key={attempt.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/quiz-results/${attempt.id}`}
                      className="text-sm font-medium text-indigo-600 truncate hover:underline"
                    >
                      {attempt.topics.title}
                    </Link>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (attempt.score / attempt.total_questions) >= 0.7 
                          ? 'bg-green-100 text-green-800' 
                          : (attempt.score / attempt.total_questions) >= 0.4 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        Score: {attempt.score}/{attempt.total_questions}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {Math.round((attempt.score / attempt.total_questions) * 100)}% correct
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {new Date(attempt.completed_at).toLocaleDateString()} • {' '}
                        {attempt.time_spent ? `${Math.floor(attempt.time_spent / 60)}:${String(attempt.time_spent % 60).padStart(2, '0')}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't taken any quizzes yet.</p>
          <Link 
            href="/topics" 
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-900"
          >
            Browse available topics
          </Link>
        </div>
      )}
    </div>
  )
}