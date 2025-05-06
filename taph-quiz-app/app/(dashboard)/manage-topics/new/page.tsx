import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import TopicForm from '@/components/topics/topic-form'

export default async function CreateTopicPage() {
  const supabase = await createClient()
  
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
  
  async function createTopic(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
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
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title,
          description,
          is_published: isPublished,
          created_by: user.id
        })
        .select('id')
        .single()
      
      if (error) {
        console.error('Error creating topic:', error)
        return { error: error.message }
      }
      
      // Revalidate paths
      revalidatePath('/manage-topics')
      revalidatePath('/topics')
      
      return { success: true, topicId: data.id }
    } catch (err: any) {
      console.error('Error creating topic:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Topic
        </h3>
      </div>
      
      <TopicForm 
        action={createTopic}
        returnPath="/manage-topics"
      />
    </div>
  )
}