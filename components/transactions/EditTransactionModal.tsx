'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { X, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  category: string | null
  date: string
}

interface EditTransactionModalProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  onDelete?: () => void
}

const expenseCategories = [
  'groceries',
  'rent',
  'transport',
  'entertainment',
  'utilities',
  'bills',
  'subscription',
  'insurance',
  'internet',
  'other',
]

const incomeCategories = [
  'salary',
  'freelance',
  'investment',
  'other',
]

export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onDelete,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    category: transaction.category || '',
    description: transaction.description || '',
    date: format(parseISO(transaction.date), 'yyyy-MM-dd'),
  })
  const router = useRouter()
  const supabase = createClient()

  const isIncome = ['salary', 'loan_received', 'loan_repayment_received'].includes(transaction.type)
  const isLoan = transaction.type.includes('loan')
  const categories = isIncome ? incomeCategories : expenseCategories

  useEffect(() => {
    if (isOpen) {
      // Handle both ISO date strings and date-only strings
      let dateStr = transaction.date
      if (dateStr.includes('T')) {
        dateStr = format(parseISO(transaction.date), 'yyyy-MM-dd')
      } else {
        dateStr = transaction.date
      }

      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category || '',
        description: transaction.description || '',
        date: dateStr,
      })
      setError(null)
    }
  }, [isOpen, transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      const dateObj = new Date(formData.date)
      const month = dateObj.getMonth() + 1
      const year = dateObj.getFullYear()

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          amount,
          category: formData.category || null,
          description: formData.description || null,
          date: formData.date,
          month,
          year,
        })
        .eq('id', transaction.id)

      if (updateError) throw updateError

      // Trigger refresh event instead of router.refresh()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      if (deleteError) throw deleteError

      if (onDelete) onDelete()
      // Trigger refresh event instead of router.refresh()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-[500px] transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[90vh] mt-4 sm:mt-0 mb-20 sm:mb-0 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-main">
              Edit Transaction
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isLoan ? 'Loan transactions cannot be edited here' : 'Update transaction details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoan ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                Loan-related transactions should be managed through the Loans section.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">
                  Amount (PKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Add a note..."
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-text-main font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Transaction'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
