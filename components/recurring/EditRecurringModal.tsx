'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { X, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RecurringItem {
  id: string
  type: string
  amount: number
  category: string | null
  description: string | null
  frequency: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  next_date: string
  end_date: string | null
  is_active: boolean
}

interface EditRecurringModalProps {
  item: RecurringItem
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const incomeCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'other_income', label: 'Other Income' },
]

const expenseCategories = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'internet', label: 'Internet' },
  { value: 'phone', label: 'Phone' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'transport', label: 'Transport' },
  { value: 'other_expense', label: 'Other' },
]

export default function EditRecurringModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: EditRecurringModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: item.amount.toString(),
    type: item.type,
    category: item.category || '',
    description: item.description || '',
    frequency: item.frequency,
    start_date: format(parseISO(item.start_date), 'yyyy-MM-dd'),
    next_date: format(parseISO(item.next_date), 'yyyy-MM-dd'),
    end_date: item.end_date ? format(parseISO(item.end_date), 'yyyy-MM-dd') : '',
  })
  const router = useRouter()
  const supabase = createClient()

  const isIncome = item.type === 'income' || item.type === 'salary'
  const categories = isIncome ? incomeCategories : expenseCategories

  useEffect(() => {
    if (isOpen) {
      // Handle both ISO date strings and date-only strings
      let startDateStr = item.start_date
      let nextDateStr = item.next_date
      
      if (startDateStr.includes('T')) {
        startDateStr = format(parseISO(item.start_date), 'yyyy-MM-dd')
      }
      if (nextDateStr.includes('T')) {
        nextDateStr = format(parseISO(item.next_date), 'yyyy-MM-dd')
      }

      setFormData({
        amount: item.amount.toString(),
        type: item.type,
        category: item.category || '',
        description: item.description || '',
        frequency: item.frequency,
        start_date: startDateStr,
        next_date: nextDateStr,
        end_date: item.end_date ? (item.end_date.includes('T') ? format(parseISO(item.end_date), 'yyyy-MM-dd') : item.end_date) : '',
      })
      setError(null)
    }
  }, [isOpen, item])

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

      const updateData: any = {
        amount,
        type: formData.type,
        category: formData.category || null,
        description: formData.description || null,
        frequency: formData.frequency,
        start_date: formData.start_date,
        next_date: formData.next_date,
      }

      if (formData.end_date) {
        updateData.end_date = formData.end_date
      } else {
        updateData.end_date = null
      }

      const { error: updateError } = await supabase
        .from('recurring_items')
        .update(updateData)
        .eq('id', item.id)

      if (updateError) throw updateError

      // Trigger refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update recurring item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recurring item? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('recurring_items')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError

      // Trigger refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete recurring item')
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
        className="relative w-full sm:max-w-[600px] transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[90vh] mt-4 sm:mt-0 mb-20 sm:mb-0 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-main">
              Edit Recurring Item
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Update recurring item details
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.type === 'income' || formData.type === 'salary'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className={`w-5 h-5 ${formData.type === 'income' || formData.type === 'salary' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="font-bold text-sm text-text-main">Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.type !== 'income' && formData.type !== 'salary'
                      ? 'border-expense bg-expense/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className={`w-5 h-5 ${formData.type !== 'income' && formData.type !== 'salary' ? 'text-expense' : 'text-gray-400'}`} />
                  <span className="font-bold text-sm text-text-main">Expense</span>
                </button>
              </div>
            </div>

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
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'weekly' | 'yearly' })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Next Date */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Next Date
              </label>
              <input
                type="date"
                required
                value={formData.next_date}
                onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* End Date (Optional) */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
              />
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-text-main font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Item'}
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
        </div>
      </div>
    </div>
  )
}
