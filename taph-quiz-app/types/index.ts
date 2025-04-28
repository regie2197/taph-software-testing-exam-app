import { Database } from '@/lib/supabase/database.types'

// Extract database types
type DbProfile = Database['public']['Tables']['profiles']['Row']
type DbTopic = Database['public']['Tables']['topics']['Row']
type DbQuestion = Database['public']['Tables']['questions']['Row']
type DbAnswer = Database['public']['Tables']['answers']['Row']
type DbQuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
type DbQuestionResponse = Database['public']['Tables']['question_responses']['Row']

// Application types based on database schema
export type UserRole = DbProfile['role']

export type Profile = DbProfile

export type Topic = DbTopic

export type Question = DbQuestion & {
  answers?: Answer[] // Add related data that might be joined
}

export type Answer = DbAnswer

export type QuizAttempt = DbQuizAttempt & {
  topic?: Topic // Add joined data
  responses?: QuestionResponse[]
}

export type QuestionResponse = DbQuestionResponse & {
  question?: Question
  selected_answer?: Answer
}

// Add any additional application-specific types here
export type QuizSubmission = {
  topicId: string
  responses: {
    questionId: string
    answerId: string | null
  }[]
  timeSpent: number
}