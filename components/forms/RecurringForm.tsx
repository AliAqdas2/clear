'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, RefreshCw, ChevronDown } from 'lucide-react'

interface RecurringFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function RecurringForm({ onSuccess, onCancel }: RecurringFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
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

      const { error: insertError } = await supabase.from('recurring_items').insert({
        user_id: user.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || null,
        frequency: 'monthly',
        start_date: formData.startDate,
        next_date: formData.startDate,
      })

      if (insertError) throw insertError
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to add recurring item')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Type Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-bold uppercase tracking-wider">Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              formData.type === 'income'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <TrendingUp className={`w-6 h-6 ${formData.type === 'income' ? 'text-primary' : 'text-gray-400'}`} />
            <span className="font-bold text-text-main">Income</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              formData.type === 'expense'
                ? 'border-expense bg-expense/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <TrendingDown className={`w-6 h-6 ${formData.type === 'expense' ? 'text-expense' : 'text-gray-400'}`} />
            <span className="font-bold text-text-main">Expense</span>
          </button>
        </div>
      </div>

      {/* Amount Field */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-bold uppercase tracking-wider" htmlFor="amount">
          Monthly Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main text-2xl font-bold">PKR</span>
          <input
            className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-16 pl-16 pr-4 text-3xl font-bold"
            id="amount"
            name="amount"
            placeholder="0"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Category and Start Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Field */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium" htmlFor="category">
            Category
          </label>
          <div className="relative">
            <select
              className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-14 px-4 text-base font-medium appearance-none"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
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

        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium" htmlFor="startDate">
            Start Date
          </label>
          <input
            className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-14 px-4 text-base font-medium"
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-medium" htmlFor="description">
          Description (Optional)
        </label>
        <input
          className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-14 px-4 text-base font-medium"
          id="description"
          name="description"
          placeholder="e.g., Netflix subscription"
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
          className="w-full md:flex-1 py-3 px-8 rounded-lg bg-primary text-text-main font-bold text-base hover:brightness-105 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          {loading ? 'Adding...' : 'Add Recurring'}
        </button>
      </div>
    </form>
  )
}
