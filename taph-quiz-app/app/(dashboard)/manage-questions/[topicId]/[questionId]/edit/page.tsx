import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { QuestionForm } from '@/components/questions/question-form'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function EditQuestionPage({ 
    params 
  }: { 
    params: Promise<{ topicId: string; questionId: string }> 
  }) {
    const { topicId, questionId } = await params;
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Edit Question
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          <Link href={`/manage-questions/${topicId}`} className="text-indigo-600 hover:text-indigo-900">
            Back to questions
          </Link>
        </p>
      </div>
      
      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-md mt-6"></div>}>
        <EditQuestionForm topicId={topicId} questionId={questionId} />
      </Suspense>
    </div>
  )
}

async function EditQuestionForm({ topicId, questionId }: { topicId: string, questionId: string }) {
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
  
  // Get question details
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .eq('topic_id', topicId)
    .single()
  
  if (questionError || !question) {
    notFound()
  }
  
  // Check if the user is the creator of the question or topic
  if (question.created_by !== user.id) {
    // Check if user owns the topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('created_by')
      .eq('id', topicId)
      .single()
    
    if (topicError || topic.created_by !== user.id) {
      redirect('/manage-topics')
    }
  }
  
  // Get answers for this question
  const { data: answers, error: answersError } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
  
  if (answersError) {
    console.error('Error fetching answers:', answersError)
    return (
      <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
        Error loading question data. Please try again.
      </div>
    )
  }

  // Get topic details
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  
  if (topicError) {
    console.error('Error fetching topic:', topicError)
  }
  
  async function updateQuestion(formData: FormData) {
    'use server'
    
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Authentication error' }
    }
    
    const questionText = formData.get('questionText') as string
    const difficultyLevel = formData.get('difficultyLevel') as string
    const answerCount = parseInt(formData.get('answerCount') as string, 10)
    
    if (!questionText || questionText.trim() === '') {
      return { error: 'Question text is required' }
    }
    
    try {
      // Update question
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          question_text: questionText,
          difficulty_level: difficultyLevel,
        })
        .eq('id', questionId)
      
      if (updateError) {
        console.error('Error updating question:', updateError)
        return { error: updateError.message }
      }
      
      // Process answers
      const answersToUpdate = []
      const answersToCreate = []
      const existingAnswerIds = new Set()
      
      for (let i = 0; i < answerCount; i++) {
        const answerId = formData.get(`answerId_${i}`) as string
        const answerText = formData.get(`answerText_${i}`) as string
        const isCorrect = formData.get(`isCorrect_${i}`) === 'on'
        const explanation = formData.get(`explanation_${i}`) as string
        
        if (answerId) {
          existingAnswerIds.add(answerId)
          answersToUpdate.push({
            id: answerId,
            answer_text: answerText,
            is_correct: isCorrect,
            explanation: explanation || null,
          })
        } else {
          answersToCreate.push({
            question_id: questionId,
            answer_text: answerText,
            is_correct: isCorrect,
            explanation: explanation || null,
          })
        }
      }
      
      // Update existing answers
      if (answersToUpdate.length > 0) {
        const { error: updateAnswersError } = await supabase
          .from('answers')
          .upsert(answersToUpdate)
        
        if (updateAnswersError) {
          console.error('Error updating answers:', updateAnswersError)
          return { error: updateAnswersError.message }
        }
      }
      
      // Create new answers
      if (answersToCreate.length > 0) {
        const { error: createAnswersError } = await supabase
          .from('answers')
          .insert(answersToCreate)
        
        if (createAnswersError) {
          console.error('Error creating answers:', createAnswersError)
          return { error: createAnswersError.message }
        }
      }
      
      // Delete answers that were removed
      const allExistingAnswerIds = (answers || []).map(a => a.id)
      const answersToDelete = allExistingAnswerIds.filter(id => !existingAnswerIds.has(id))
      
      if (answersToDelete.length > 0) {
        const { error: deleteAnswersError } = await supabase
          .from('answers')
          .delete()
          .in('id', answersToDelete)
        
        if (deleteAnswersError) {
          console.error('Error deleting answers:', deleteAnswersError)
          return { error: deleteAnswersError.message }
        }
      }
      
      // Revalidate paths
      revalidatePath(`/manage-questions/${topicId}`)
      revalidatePath(`/topics/${topicId}`)
      
      return { success: true }
    } catch (err: any) {
      console.error('Error updating question:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }
  
  return (
    <QuestionForm
      action={updateQuestion}
      topicId={topicId}
      question={question}
      answers={answers || []}
      topic={topic}
      editMode={true}
      returnPath={`/manage-questions/${topicId}`}
    />
  )
}