import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function ManageQuestionsPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  
  return (
    <div>
      <Suspense fallback={<div className="animate-pulse h-12 bg-gray-100 rounded-md"></div>}>
        <TopicHeader topicId={topicId} />
      </Suspense>
      
      <Suspense fallback={<QuestionsListSkeleton />}>
        <QuestionsList topicId={topicId} />
      </Suspense>
    </div>
  )
}

function QuestionsListSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white shadow overflow-hidden rounded-lg animate-pulse">
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex space-x-2 mb-2">
              <div className="h-4 bg-blue-100 rounded-full w-16"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function TopicHeader({ topicId }: { topicId: string }) {
  const supabase = createClient()
  
  const { data: topic, error } = await supabase
    .from('topics')
    .select('title')
    .eq('id', topicId)
    .single()
  
  if (error || !topic) {
    return (
      <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Manage Questions
        </h3>
        <Link
          href={`/manage-questions/${topicId}/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Add Question
        </Link>
      </div>
    )
  }
  
  return (
    <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Questions for: {topic.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          <Link href="/manage-topics" className="text-indigo-600 hover:text-indigo-900">
            Back to topics
          </Link>
        </p>
      </div>
      <Link
        href={`/manage-questions/${topicId}/new`}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
      >
        Add Question
      </Link>
    </div>
  )
}

async function QuestionsList({ topicId }: { topicId: string }) {
  const supabase = createClient()
  
  // Check if user is authenticated and is a quiz master
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }
  
  // Check user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || profile?.role !== 'quiz_master') {
    redirect('/dashboard')
  }
  
  // Get topic to check ownership
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('created_by')
    .eq('id', topicId)
    .single()
  
  if (topicError || !topic) {
    notFound()
  }
  
  // Verify ownership
  if (topic.created_by !== user.id) {
    redirect('/manage-topics')
  }
  
  // Get questions for this topic
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      difficulty_level,
      created_at
    `)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
  
  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading questions. Please refresh the page.
      </div>
    )
  }
  
  if (!questions || questions.length === 0) {
    return (
      <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first question.
        </p>
        <div className="mt-6">
          <Link
            href={`/manage-questions/${topicId}/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Question
          </Link>
        </div>
      </div>
    )
  }
  
  // Get answer counts for each question
  const questionsWithAnswerCounts = await Promise.all(
    questions.map(async (question) => {
      const { count, error: countError } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', question.id)
      
      const { count: correctCount, error: correctCountError } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', question.id)
        .eq('is_correct', true)
      
      return {
        ...question,
        answerCount: countError ? 0 : count || 0,
        correctAnswerCount: correctCountError ? 0 : correctCount || 0
      }
    })
  )
  
  return (
    <div className="mt-6">
      <ul className="divide-y divide-gray-200">
        {questionsWithAnswerCounts.map((question: any) => (
          <li key={question.id} className="py-4">
            <div className="flex justify-between">
              <div className="flex-1 pr-4">
                <h4 className="text-lg font-medium text-gray-900">{question.question_text}</h4>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                    {question.difficulty_level}
                  </span>
                  <span>
                    {question.answerCount} answer{question.answerCount !== 1 ? 's' : ''}
                    {question.correctAnswerCount > 0 && 
                      ` (${question.correctAnswerCount} correct)`}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/manage-questions/${topicId}/${question.id}/edit`}
                  className="ml-2 text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}