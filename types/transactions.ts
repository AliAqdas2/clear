export interface TransactionType {
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

