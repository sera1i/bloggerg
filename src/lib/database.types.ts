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
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          post_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          post_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          post_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_name: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_name?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}
