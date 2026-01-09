'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { 
  Banknote, ShoppingCart, Home, Car, Clapperboard, Zap, 
  Receipt, Handshake, RefreshCw, Edit, Trash2, MoreVertical
} from 'lucide-react'
import { ComponentType } from 'react'
import EditTransactionModal from './EditTransactionModal'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  category: string | null
  date: string
}

interface TransactionCardProps {
  transaction: Transaction
}

const getTransactionIcon = (type: string, category?: string | null): ComponentType<{ className?: string }> => {
  switch (type) {
    case 'salary':
      return Banknote
    case 'expense':
      if (category === 'groceries') return ShoppingCart
      if (category === 'rent') return Home
      if (category === 'transport') return Car
      if (category === 'entertainment') return Clapperboard
      if (category === 'utilities') return Zap
      return Receipt
    case 'loan_received':
    case 'loan_given':
      return Handshake
    case 'loan_repayment':
    case 'loan_repayment_received':
      return RefreshCw
    default:
      return Receipt
  }
}

const getTransactionLabel = (type: string) => {
  switch (type) {
    case 'salary':
      return { text: 'Salary', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
    case 'expense':
      return { text: 'Expense', bgColor: 'bg-red-100', textColor: 'text-red-700' }
    case 'loan_received':
      return { text: 'Loan Received', bgColor: 'bg-green-100', textColor: 'text-green-700' }
    case 'loan_given':
      return { text: 'Loan Given', bgColor: 'bg-red-100', textColor: 'text-red-700' }
    case 'loan_repayment':
      return { text: 'Repayment', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    case 'loan_repayment_received':
      return { text: 'Repayment Received', bgColor: 'bg-green-100', textColor: 'text-green-700' }
    default:
      return { text: type, bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
  }
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const isIncome = ['salary', 'loan_received', 'loan_repayment_received'].includes(transaction.type)
  const Icon = getTransactionIcon(transaction.type, transaction.category)
  const label = getTransactionLabel(transaction.type)
  const isLoan = transaction.type.includes('loan')
  const canEdit = !isLoan // Don't allow editing loan transactions from here

  return (
    <>
      <div 
        className={`group p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 relative ${
          isLoan && isIncome ? 'border-l-4 border-l-primary' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-start gap-3">
          <div className={`size-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isIncome ? 'bg-green-50 text-primary' : 'bg-red-50 text-expense'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-bold text-text-main text-base flex-1 min-w-0">
                {transaction.description || transaction.category || 'Transaction'}
              </p>
              <div className="flex items-center gap-2">
                <div className={`font-bold text-lg flex-shrink-0 ${isIncome ? 'text-success' : 'text-expense'}`}>
                  {isIncome ? '+' : '-'} PKR {Number(transaction.amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors flex-shrink-0"
                    aria-label="Edit transaction"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${label.bgColor} ${label.textColor} px-2 py-0.5 rounded-md text-xs font-medium`}>
                {label.text}
              </span>
              <span className="text-xs text-text-secondary">
                {format(parseISO(transaction.date), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isIncome ? 'bg-green-50 text-primary' : 'bg-red-50 text-expense'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-text-main truncate">
              {transaction.description || transaction.category || 'Transaction'}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className={`${label.bgColor} ${label.textColor} px-2 py-0.5 rounded-md font-medium`}>
                {label.text}
              </span>
              <span className="text-text-secondary">
                {format(parseISO(transaction.date), 'h:mm a')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-bold text-lg flex-shrink-0 ${isIncome ? 'text-primary' : 'text-expense'}`}>
            {isIncome ? '+' : '-'} PKR {Number(transaction.amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditModalOpen(true)
              }}
              className="p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors"
              aria-label="Edit transaction"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Edit Modal */}
    {canEdit && (
      <EditTransactionModal
        transaction={transaction}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    )}
    </>
  )
}
