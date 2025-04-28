'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Question, Answer, Topic } from '@/types'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

type QuestionFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; }>;
  topicId: string;
  question?: Question;
  answers?: Answer[];
  topic?: Topic;
  editMode: boolean;
  returnPath?: string;
}

export function QuestionForm({ 
  action, 
  topicId, 
  question, 
  answers = [], 
  topic, 
  editMode,
  returnPath
}: QuestionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [answersList, setAnswersList] = useState<Array<{
    id?: string;
    answer_text: string;
    is_correct: boolean;
    explanation: string | null;
    tempId: number;
  }>>(
    answers.length > 0
      ? answers.map((answer, idx) => ({
          id: answer.id,
          answer_text: answer.answer_text,
          is_correct: answer.is_correct,
          explanation: answer.explanation,
          tempId: idx
        }))
      : [
          { answer_text: '', is_correct: false, explanation: null, tempId: 1 },
          { answer_text: '', is_correct: false, explanation: null, tempId: 2 },
          { answer_text: '', is_correct: false, explanation: null, tempId: 3 },
          { answer_text: '', is_correct: false, explanation: null, tempId: 4 }
        ]
  )
  
  const [nextTempId, setNextTempId] = useState(
    answers.length > 0 ? answers.length + 1 : 5
  )
  
  // Add a new answer option
  const addAnswer = () => {
    setAnswersList([
      ...answersList, 
      { answer_text: '', is_correct: false, explanation: null, tempId: nextTempId }
    ])
    setNextTempId(nextTempId + 1)
  }
  
  // Remove an answer option
  const removeAnswer = (tempId: number) => {
    if (answersList.length <= 2) {
      setError('You need at least 2 answer options')
      return
    }
    setAnswersList(answersList.filter(a => a.tempId !== tempId))
  }
  
  // Update an answer field
  const updateAnswer = (tempId: number, field: string, value: any) => {
    setAnswersList(
      answersList.map(a => 
        a.tempId === tempId 
          ? { ...a, [field]: value } 
          : field === 'is_correct' && value === true
            ? { ...a, is_correct: false } // Ensure only one correct answer if this one is marked correct
            : a
      )
    )
  }
  
  const handleSubmit = async (formData: FormData) => {
    setError(null)
    
    // Add all answers to the form data
    formData.append('answerCount', answersList.length.toString())
    
    answersList.forEach((answer, idx) => {
      if (answer.id) {
        formData.append(`answerId_${idx}`, answer.id)
      }
      formData.append(`answerText_${idx}`, answer.answer_text)
      formData.append(`isCorrect_${idx}`, answer.is_correct ? 'on' : 'off')
      formData.append(`explanation_${idx}`, answer.explanation || '')
    })
    
    // Validate form data
    const questionText = formData.get('questionText') as string
    
    if (!questionText || questionText.trim() === '') {
      setError('Question text is required')
      return
    }
    
    // Validate answers
    const filledAnswers = answersList.filter(a => a.answer_text.trim() !== '')
    if (filledAnswers.length < 2) {
      setError('You need at least 2 answer options')
      return
    }
    
    const hasCorrectAnswer = answersList.some(a => a.is_correct)
    if (!hasCorrectAnswer) {
      setError('You must mark at least one answer as correct')
      return
    }
    
    startTransition(async () => {
      try {
        const result = await action(formData)
        
        if (result.error) {
          setError(result.error)
          return
        }
        
        if (result.success) {
          router.push(returnPath || `/manage-questions/${topicId}`)
          router.refresh()
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }
  
  return (
    <form action={handleSubmit} className="mt-6 space-y-8">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}
      
      {topic && (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">
            {editMode ? 'Editing' : 'Creating'} question for topic: <span className="font-medium text-gray-900">{topic.title}</span>
          </p>
        </div>
      )}
      
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
          Question Text
        </label>
        <textarea
          id="questionText"
          name="questionText"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          defaultValue={question?.question_text || ''}
          placeholder="Enter your question here..."
          required
        />
      </div>
      
      <div>
        <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">
          Difficulty Level
        </label>
        <select
          id="difficultyLevel"
          name="difficultyLevel"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          defaultValue={question?.difficulty_level || 'medium'}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Answer Options</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add at least 2 answer options and mark the correct one(s).
        </p>
        
        <div className="mt-4 space-y-4">
          {answersList.map((answer, index) => (
            <div key={answer.tempId} className="flex flex-col space-y-2 p-4 border border-gray-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Option {index + 1}</span>
                  <input
                    type="checkbox"
                    id={`correct_${answer.tempId}`}
                    checked={answer.is_correct}
                    onChange={(e) => updateAnswer(answer.tempId, 'is_correct', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`correct_${answer.tempId}`} className="ml-2 block text-sm text-gray-700">
                    Correct answer
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeAnswer(answer.tempId)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Remove answer</span>
                </button>
              </div>
              
              <div>
                <input
                  type="text"
                  value={answer.answer_text}
                  onChange={(e) => updateAnswer(answer.tempId, 'answer_text', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter answer text..."
                />
              </div>
              
              <div>
                <label htmlFor={`explanation_${answer.tempId}`} className="block text-sm text-gray-500">
                  Explanation (optional)
                </label>
                <input
                  type="text"
                  id={`explanation_${answer.tempId}`}
                  value={answer.explanation || ''}
                  onChange={(e) => updateAnswer(answer.tempId, 'explanation', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Explain why this answer is correct/incorrect..."
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addAnswer}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Another Answer
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
        <Link
          href={returnPath || `/manage-questions/${topicId}`}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : (editMode ? 'Update Question' : 'Create Question')}
        </button>
      </div>
    </form>
  )
}