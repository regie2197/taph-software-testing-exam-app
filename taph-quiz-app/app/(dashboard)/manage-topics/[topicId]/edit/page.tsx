import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Suspense } from 'react'
import TopicForm from '@/components/topics/topic-form'
import { Topic } from '@/types'

export default async function EditTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Edit Topic
        </h3>
      </div>
      
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-md mt-6"></div>}>
        <EditTopicForm topicId={topicId} />
      </Suspense>
    </div>
  )
}

async function EditTopicForm({ topicId }: { topicId: string }) {
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
  
  // Get topic details by topicId
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  
  if (topicError || !topic) {
    notFound()
  }
  
  // Check if the user is the creator of the topic
  if (topic.created_by !== user.id) {
    redirect('/manage-topics')
  }
  
  async function updateTopic(formData: FormData) {
    'use server'
    
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: 'Authentication error' }
    }
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isPublished = formData.get('isPublished') === 'on'

    if (!title || title.trim() === '') {
      return { error: 'Title is required' }
    }

    try {
      // Update the topic
      const { error } = await supabase
        .from('topics')
        .update({
          title,
          description,
          is_published: isPublished,
        })
        .eq('id', topicId)
        .eq('created_by', user.id)

      if (error) {
        console.error('Error updating topic:', error)
        return { error: error.message }
      }

      // Revalidate paths
      revalidatePath('/manage-topics')
      revalidatePath('/topics')
      revalidatePath(`/topics/${topicId}`)
      revalidatePath(`/manage-questions/${topicId}`)

      return { success: true }
    } catch (err: any) {
      console.error('Error updating topic:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }
  
  return (
    <TopicForm 
      action={updateTopic}
      topic={topic as Topic}
      returnPath="/manage-topics"
    />
  )
}