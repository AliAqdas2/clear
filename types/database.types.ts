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
          real_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          real_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          real_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          lender_id: string
          borrower_id: string
          amount: number
          remaining_amount: number
          due_date: string
          notes: string | null
          status: 'pending' | 'accepted' | 'active' | 'repaid' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lender_id: string
          borrower_id: string
          amount: number
          remaining_amount?: number
          due_date: string
          notes?: string | null
          status?: 'pending' | 'accepted' | 'active' | 'repaid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lender_id?: string
          borrower_id?: string
          amount?: number
          remaining_amount?: number
          due_date?: string
          notes?: string | null
          status?: 'pending' | 'accepted' | 'active' | 'repaid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense' | 'loan_received' | 'loan_given' | 'loan_repayment' | 'loan_repayment_received' | 'salary'
          amount: number
          category: string | null
          source: string | null
          description: string | null
          date: string
          loan_id: string | null
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense' | 'loan_received' | 'loan_given' | 'loan_repayment' | 'loan_repayment_received' | 'salary'
          amount: number
          category?: string | null
          source?: string | null
          description?: string | null
          date: string
          loan_id?: string | null
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense' | 'loan_received' | 'loan_given' | 'loan_repayment' | 'loan_repayment_received' | 'salary'
          amount?: number
          category?: string | null
          source?: string | null
          description?: string | null
          date?: string
          loan_id?: string | null
          month?: number
          year?: number
          created_at?: string
        }
      }
      recurring_items: {
        Row: {
          id: string
          user_id: string
          type: 'salary' | 'expense' | 'rent' | 'bills' | 'transport'
          amount: number
          frequency: 'monthly' | 'weekly' | 'yearly'
          start_date: string
          end_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'salary' | 'expense' | 'rent' | 'bills' | 'transport'
          amount: number
          frequency?: 'monthly' | 'weekly' | 'yearly'
          start_date: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'salary' | 'expense' | 'rent' | 'bills' | 'transport'
          amount?: number
          frequency?: 'monthly' | 'weekly' | 'yearly'
          start_date?: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      monthly_snapshots: {
        Row: {
          id: string
          user_id: string
          month: number
          year: number
          total_income: number
          total_expenses: number
          remaining_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: number
          year: number
          total_income?: number
          total_expenses?: number
          remaining_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: number
          year?: number
          total_income?: number
          total_expenses?: number
          remaining_balance?: number
          created_at?: string
        }
      }
    }
  }
}

