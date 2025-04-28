export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          role: 'user' | 'quiz_master'
          created_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          role?: 'user' | 'quiz_master'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'user' | 'quiz_master'
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          created_by: string
          is_published: boolean
          slug: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          created_by: string
          is_published?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          created_by?: string
          is_published?: boolean
        }
      }
      questions: {
        Row: {
          id: string
          topic_id: string
          question_text: string
          difficulty_level: 'easy' | 'medium' | 'hard'
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          topic_id: string
          question_text: string
          difficulty_level?: 'easy' | 'medium' | 'hard'
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          topic_id?: string
          question_text?: string
          difficulty_level?: 'easy' | 'medium' | 'hard'
          created_at?: string
          created_by?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          answer_text: string
          is_correct: boolean
          explanation: string | null
        }
        Insert: {
          id?: string
          question_id: string
          answer_text: string
          is_correct?: boolean
          explanation?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          answer_text?: string
          is_correct?: boolean
          explanation?: string | null
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          score: number
          total_questions: number
          completed_at: string
          time_spent: number | null
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          score: number
          total_questions: number
          completed_at?: string
          time_spent?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          score?: number
          total_questions?: number
          completed_at?: string
          time_spent?: number | null
        }
      }
      question_responses: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          answer_id: string | null
          is_correct: boolean
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          answer_id?: string | null
          is_correct?: boolean
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          answer_id?: string | null
          is_correct?: boolean
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}