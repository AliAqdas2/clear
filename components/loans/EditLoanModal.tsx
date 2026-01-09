'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { X, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Loan {
  id: string
  amount: string | number
  remaining_amount: string | number
  due_date: string
  notes: string | null
  lender_id: string
  borrower_id: string
  status: 'pending' | 'accepted' | 'active' | 'repaid' | 'cancelled'
}

interface EditLoanModalProps {
  loan: Loan
  isOpen: boolean
  onClose: () => void
  personName: string
  isNonPlatformLoan: boolean
  onSuccess?: () => void
}

export default function EditLoanModal({
  loan,
  isOpen,
  onClose,
  personName,
  isNonPlatformLoan,
  onSuccess,
}: EditLoanModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: (loan.remaining_amount || loan.amount).toString(),
    due_date: format(parseISO(loan.due_date), 'yyyy-MM-dd'),
    notes: loan.notes || '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: (loan.remaining_amount || loan.amount).toString(),
        due_date: format(parseISO(loan.due_date), 'yyyy-MM-dd'),
        notes: loan.notes || '',
      })
      setError(null)
    }
  }, [isOpen, loan])

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

      const { error: updateError } = await supabase
        .from('loans')
        .update({
          remaining_amount: amount,
          amount: amount, // Update original amount too
          due_date: formData.due_date,
          notes: formData.notes || null,
        })
        .eq('id', loan.id)

      if (updateError) throw updateError

      onClose()
      if (onSuccess) {
        onSuccess()
      } else {
        // Fallback to page reload if no callback provided
        setTimeout(() => {
          window.location.reload()
        }, 300)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update loan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this loan with ${personName}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('loans')
        .delete()
        .eq('id', loan.id)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      // Close modal first
      onClose()
      if (onSuccess) {
        onSuccess()
      } else {
        // Fallback to page reload if no callback provided
        setTimeout(() => {
          window.location.reload()
        }, 300)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete loan')
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
              Edit Loan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {personName}
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

            {/* Due Date */}
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Notes (for non-platform loans) */}
            {isNonPlatformLoan && (
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-text-main focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g., From: John Doe"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-text-main font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Loan'}
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
