'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { 
  Banknote, ShoppingCart, Home, Car, Clapperboard, Zap, 
  Receipt, Handshake, RefreshCw, Edit
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

interface TransactionsTableProps {
  transactions: Transaction[]
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

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-text-main mb-1">No transactions yet</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          Add your first expense or income to see where your money goes.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden divide-y divide-gray-100">
        {transactions.map((transaction) => {
          const isIncome = ['salary', 'loan_received', 'loan_repayment_received'].includes(transaction.type)
          const Icon = getTransactionIcon(transaction.type, transaction.category)
          const label = getTransactionLabel(transaction.type)
          const isLoan = transaction.type.includes('loan')
          const canEdit = !isLoan

          return (
            <div
              key={transaction.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                isLoan && isIncome ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isIncome ? 'bg-green-50 text-primary' : 'bg-red-50 text-expense'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-main text-base truncate">
                      {transaction.description || transaction.category || 'Transaction'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`${label.bgColor} ${label.textColor} px-2 py-0.5 rounded-md text-xs font-medium`}>
                        {label.text}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {format(parseISO(transaction.date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`font-bold text-base ${isIncome ? 'text-success' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'} PKR {Number(transaction.amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors"
                      aria-label="Edit transaction"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block">
        <table className="w-full divide-y divide-gray-100 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">
                Transaction
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const isIncome = ['salary', 'loan_received', 'loan_repayment_received'].includes(transaction.type)
              const Icon = getTransactionIcon(transaction.type, transaction.category)
              const label = getTransactionLabel(transaction.type)
              const isLoan = transaction.type.includes('loan')
              const canEdit = !isLoan

              return (
                <tr 
                  key={transaction.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isLoan && isIncome ? 'border-l-4 border-l-primary' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-green-50 text-primary' : 'bg-red-50 text-expense'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-text-main truncate">
                          {transaction.description || transaction.category || 'Transaction'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${label.bgColor} ${label.textColor} px-2 py-0.5 rounded-md text-xs font-medium`}>
                      {label.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-base font-bold ${isIncome ? 'text-success' : 'text-expense'}`}>
                      {isIncome ? '+' : '-'} PKR {Number(transaction.amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-text-secondary">
                      {format(parseISO(transaction.date), 'MMM d, h:mm a')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEdit ? (
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                        aria-label="Edit transaction"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-text-secondary">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  )
}
