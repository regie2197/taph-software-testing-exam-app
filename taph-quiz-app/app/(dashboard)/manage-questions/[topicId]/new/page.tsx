import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { QuestionForm } from '@/components/questions/question-form'
import Link from 'next/link'

export default async function NewQuestionPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;

  
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }
  
  // Get topic details
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  
  if (topicError || !topic) {
    redirect('/manage-topics')
  }
  
  // Check if user is the owner
  if (topic.created_by !== user.id) {
    redirect('/manage-topics')
  }

  // Check if user has the quiz_master role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || profile?.role !== 'quiz_master') {
    redirect('/dashboard')
  }

  async function createQuestion(formData: FormData) {
    'use server'

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      redirect('/login')
    }

    const questionText = formData.get('questionText') as string
    const difficultyLevel = formData.get('difficultyLevel') as string
    const answerCount = parseInt(formData.get('answerCount') as string, 10)

    const answers = []
    for (let i = 0; i < answerCount; i++) {
      answers.push({
        id: formData.get(`answerId_${i}`),
        answer_text: formData.get(`answerText_${i}`),
        is_correct: formData.get(`isCorrect_${i}`) === 'on',
        explanation: formData.get(`explanation_${i}`),
      })
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          topic_id: topicId,
          question_text: questionText,
          difficulty_level: difficultyLevel,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating question:', error)
        return { error: error.message }
      }

      const questionId = data.id

      // Insert answers
      const { error: answersError } = await supabase
        .from('answers')
        .insert(
          answers.map((answer) => ({
            question_id: questionId,
            answer_text: answer.answer_text,
            is_correct: answer.is_correct,
            explanation: answer.explanation,
          }))
        )

      if (answersError) {
        console.error('Error inserting answers:', answersError)
        return { error: answersError.message }
      }

      // Revalidate paths
      revalidatePath(`/manage-questions/${topicId}`)
      revalidatePath(`/topics/${topicId}`)

      return { success: true }
    } catch (err: any) {
      console.error('Error creating question:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Add Question to "{topic.title}"
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          <Link href={`/manage-questions/${topicId}`} className="text-indigo-600 hover:text-indigo-900">
            Back to questions
          </Link>
        </p>
      </div>
      
      <QuestionForm
        action={createQuestion}
        topicId={topicId}
        topic={topic}
        editMode={false}
        returnPath={`/manage-questions/${topicId}`}
      />
    </div>
  )
}