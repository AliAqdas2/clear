'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { X, Check, AlertCircle, DollarSign } from 'lucide-react'

interface Loan {
  id: string
  amount: string | number
  remaining_amount: string | number
  due_date: string
  notes: string | null
  lender_id: string
  borrower_id: string
  lender?: { username: string; real_name: string | null }
  borrower?: { username: string; real_name: string | null }
}

interface LoanRepaymentModalProps {
  loan: Loan
  isOpen: boolean
  onClose: () => void
  isMyDebt: boolean
  personName: string
}

export default function LoanRepaymentModal({
  loan,
  isOpen,
  onClose,
  isMyDebt,
  personName,
}: LoanRepaymentModalProps) {
  const [repaymentAmount, setRepaymentAmount] = useState('')
  const [repaymentType, setRepaymentType] = useState<'full' | 'partial'>('full')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const remainingAmount = Number(loan.remaining_amount || loan.amount)
  const fullAmount = remainingAmount.toLocaleString()

  if (!isOpen) return null

  const handleAmountChange = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      setRepaymentAmount('')
      setRepaymentType('partial')
      return
    }
    if (num >= remainingAmount) {
      setRepaymentAmount(remainingAmount.toString())
      setRepaymentType('full')
    } else {
      setRepaymentAmount(value)
      setRepaymentType('partial')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const amount = repaymentType === 'full' 
      ? remainingAmount 
      : parseFloat(repaymentAmount)

    if (amount <= 0 || amount > remainingAmount) {
      setError('Invalid repayment amount')
      setLoading(false)
      return
    }

    const newRemaining = remainingAmount - amount
    const now = new Date()

    // Update loan
    const updateData: any = {
      remaining_amount: Math.max(0, newRemaining),
      updated_at: new Date().toISOString(),
    }

    if (newRemaining <= 0) {
      updateData.status = 'repaid'
    }

    const { error: updateError } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', loan.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Create repayment transaction
    const transactionType = isMyDebt ? 'loan_repayment' : 'loan_repayment_received'
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: transactionType,
      amount,
      description: `Loan repayment ${isMyDebt ? 'to' : 'from'} ${personName}${repaymentType === 'partial' ? ` (Partial: PKR ${amount.toLocaleString()})` : ''}`,
      category: 'loan',
      date: format(now, 'yyyy-MM-dd'),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      loan_id: loan.id,
    })

    if (txError) {
      console.error('Transaction error:', txError)
      setError(txError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      onClose()
      router.refresh()
    }, 1500)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-6 pr-10">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-1 sm:mb-2">
            {isMyDebt ? 'Repay Loan' : 'Record Payment'}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            {isMyDebt 
              ? `Record a repayment to ${personName}` 
              : `Record a payment received from ${personName}`
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Repayment recorded successfully!</span>
          </div>
        )}

        {/* Loan Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-text-secondary">Remaining Amount</span>
            <span className="text-xl sm:text-2xl font-bold text-text-main">
              PKR {fullAmount}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-text-secondary">
            <span>Original Amount</span>
            <span>PKR {Number(loan.amount).toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          {/* Repayment Type */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRepaymentType('full')
                setRepaymentAmount(remainingAmount.toString())
              }}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base active:scale-[0.98] ${
                repaymentType === 'full'
                  ? 'bg-primary text-text-main shadow-sm'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Full Payment
            </button>
            <button
              type="button"
              onClick={() => {
                setRepaymentType('partial')
                if (!repaymentAmount || parseFloat(repaymentAmount) >= remainingAmount) {
                  setRepaymentAmount('')
                }
              }}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base active:scale-[0.98] ${
                repaymentType === 'partial'
                  ? 'bg-primary text-text-main shadow-sm'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Partial Payment
            </button>
          </div>

          {/* Amount Input */}
          {repaymentType === 'partial' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-text-main" htmlFor="amount">
                Repayment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-main text-lg sm:text-xl font-bold">
                  PKR
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingAmount}
                  value={repaymentAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 sm:pl-16 pr-4 py-3 sm:py-3.5 rounded-lg border border-input-border focus:border-primary focus:ring-2 focus:ring-primary/50 text-base sm:text-lg font-bold"
                  required={repaymentType === 'partial'}
                />
              </div>
              <p className="text-xs text-text-secondary">
                Maximum: PKR {fullAmount}
              </p>
            </div>
          )}

          {repaymentType === 'full' && (
            <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Full Payment: PKR {fullAmount}</span>
              </div>
            </div>
          )}

          {/* Actions - Sticky on mobile */}
          <div className="flex gap-3 mt-auto pt-4 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-text-main font-bold hover:bg-gray-50 transition-colors active:scale-[0.98] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-text-main font-bold hover:brightness-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Processing</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  Done
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isMyDebt ? 'Record Repayment' : 'Record Payment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
