'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { PlusCircle, ChevronDown, RefreshCw } from 'lucide-react'

interface ExpenseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const amount = parseFloat(formData.amount)
      const dateObj = new Date(formData.date)
      const month = dateObj.getMonth() + 1
      const year = dateObj.getFullYear()

      // If recurring, create a recurring item
      if (isRecurring) {
        const { error: recurringError } = await supabase.from('recurring_items').insert({
          user_id: user.id,
          type: 'expense',
          amount,
          category: formData.category,
          description: formData.description || formData.category,
          frequency: 'monthly',
          start_date: formData.date,
          next_date: formData.date,
        })

        if (recurringError) throw recurringError
      }

      // Always create the transaction for the selected date's month
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'expense',
        amount,
        category: formData.category,
        description: formData.description || null,
        date: formData.date,
        month,
        year,
      })

      if (insertError) throw insertError
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const categories = [
    { value: 'groceries', label: 'Groceries', recurring: false },
    { value: 'rent', label: 'Rent & Housing', recurring: true },
    { value: 'transport', label: 'Transport', recurring: false },
    { value: 'entertainment', label: 'Entertainment', recurring: false },
    { value: 'shopping', label: 'Shopping', recurring: false },
    { value: 'utilities', label: 'Utilities', recurring: true },
    { value: 'food', label: 'Food & Dining', recurring: false },
    { value: 'health', label: 'Health', recurring: false },
    { value: 'subscription', label: 'Subscription', recurring: true },
    { value: 'insurance', label: 'Insurance', recurring: true },
    { value: 'internet', label: 'Internet & Phone', recurring: true },
    { value: 'other', label: 'Other', recurring: false },
  ]

  // Auto-suggest recurring based on category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData({ ...formData, category: value })
    
    const selectedCategory = categories.find(c => c.value === value)
    if (selectedCategory?.recurring) {
      setIsRecurring(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Amount Field (Hero) */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-bold leading-normal uppercase tracking-wider" htmlFor="amount">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main text-3xl font-bold">PKR</span>
          <input
            autoFocus
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-white focus:border-primary h-20 placeholder:text-gray-300 pl-20 pr-4 text-4xl font-bold leading-normal tracking-tight"
            id="amount"
            name="amount"
            placeholder="0"
            step="1"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Date and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Field */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium leading-normal" htmlFor="date">
            Date
          </label>
          <input
            className="form-input w-full rounded-lg text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-white focus:border-primary h-14 px-4 text-base font-medium"
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category Field */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium leading-normal" htmlFor="category">
            Category
          </label>
          <div className="relative">
            <select
              className="form-select w-full rounded-lg text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-white focus:border-primary h-14 px-4 text-base font-medium appearance-none"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-input-border bg-gray-50">
        <div className={`p-2 rounded-lg ${isRecurring ? 'bg-expense/10 text-expense' : 'bg-gray-200 text-gray-500'}`}>
          <RefreshCw className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <label htmlFor="recurring" className="text-sm font-bold text-text-main cursor-pointer">
            Recurring Expense
          </label>
          <p className="text-xs text-text-secondary">
            This will be deducted automatically every month
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isRecurring ? 'bg-expense' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isRecurring ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Notes Field */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-medium leading-normal" htmlFor="description">
          Notes (Optional)
        </label>
        <textarea
          className="form-textarea w-full rounded-lg text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-white focus:border-primary p-4 text-base font-normal resize-none"
          id="description"
          name="description"
          placeholder="What was this expense for?"
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-4 mt-4 pt-4 border-t border-dashed border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto px-8 py-3 rounded-lg border border-transparent text-text-main font-bold hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:flex-1 py-3 px-8 rounded-lg bg-primary text-text-main font-bold text-base hover:brightness-105 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-5 h-5" />
          {loading ? 'Adding...' : isRecurring ? 'Add Recurring Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}
