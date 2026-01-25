'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { PlusCircle, ChevronDown, RefreshCw } from 'lucide-react'

interface IncomeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function IncomeForm({ onSuccess, onCancel }: IncomeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
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
          type: 'income',
          amount,
          category: formData.source,
          description: formData.description || formData.source,
          frequency: 'monthly',
          start_date: formData.date,
          next_date: formData.date,
        })

        if (recurringError) throw recurringError
      }

      // Always create the transaction for the selected date's month
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'salary',
        amount,
        category: formData.source,
        description: formData.description || formData.source,
        date: formData.date,
        month,
        year,
      })

      if (insertError) throw insertError
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to add income')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const sources = [
    { value: 'salary', label: 'Salary', recurring: true },
    { value: 'freelance', label: 'Freelance', recurring: false },
    { value: 'business', label: 'Business Income', recurring: false },
    { value: 'investment', label: 'Investment Returns', recurring: false },
    { value: 'rental', label: 'Rental Income', recurring: true },
    { value: 'gift', label: 'Gift', recurring: false },
    { value: 'other', label: 'Other', recurring: false },
  ]

  // Auto-suggest recurring based on source
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData({ ...formData, source: value })
    
    const selectedSource = sources.find(s => s.value === value)
    if (selectedSource?.recurring) {
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

      {/* Date and Source Row */}
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

        {/* Source Field */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium leading-normal" htmlFor="source">
            Source
          </label>
          <div className="relative">
            <select
              className="form-select w-full rounded-lg text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-white focus:border-primary h-14 px-4 text-base font-medium appearance-none"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleSourceChange}
              required
            >
              <option value="" disabled>Select Source</option>
              {sources.map((src) => (
                <option key={src.value} value={src.value}>{src.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-input-border bg-gray-50">
        <div className={`p-2 rounded-lg ${isRecurring ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
          <RefreshCw className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <label htmlFor="recurring" className="text-sm font-bold text-text-main cursor-pointer">
            Recurring Income
          </label>
          <p className="text-xs text-text-secondary">
            This will be added automatically every month
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isRecurring ? 'bg-primary' : 'bg-gray-300'
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
          placeholder="Additional details about this income"
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
          {loading ? 'Adding...' : isRecurring ? 'Add Recurring Income' : 'Add Income'}
        </button>
      </div>
    </form>
  )
}
