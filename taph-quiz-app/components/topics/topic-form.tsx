'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Topic } from '@/types'

type TopicFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; topicId?: string }>;
  topic?: Topic;
  returnPath?: string;
}

export default function TopicForm({ action, topic, returnPath = '/manage-topics' }: TopicFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (formData: FormData) => {
    setError(null)
    
    const title = formData.get('title') as string
    
    if (!title || title.trim() === '') {
      setError('Title is required')
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
          if (result.topicId && !topic) {
            // If creating a new topic and we have an ID, go to manage questions for that topic
            router.push(`/manage-questions/${result.topicId}`)
          } else {
            // Otherwise go to the return path
            router.push(returnPath)
          }
          router.refresh()
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }
  
  return (
    <form action={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Topic Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={topic?.title || ''}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Introduction to Software Testing"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={topic?.description || ''}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Provide a detailed description of this topic..."
        ></textarea>
      </div>
      
      <div className="flex items-center">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          defaultChecked={topic?.is_published || false}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
          Publish topic (visible to all users)
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
        <Link
          href={returnPath}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : (topic ? 'Update Topic' : 'Create Topic')}
        </button>
      </div>
    </form>
  )
}