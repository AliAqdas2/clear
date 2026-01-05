'use client'

import { useState } from 'react'
import { format, parseISO, differenceInDays, isPast } from 'date-fns'
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Calendar, User, Handshake } from 'lucide-react'
import LoanRepaymentModal from './LoanRepaymentModal'

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

interface LoansTableProps {
  loans: Loan[]
  userId: string
}

function extractPersonName(notes: string | null): string | null {
  if (!notes) return null
  const match = notes.match(/^(From|To): ([^-]+)/)
  if (match) {
    return match[2].trim()
  }
  return null
}

export default function LoansTable({ loans, userId }: LoansTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<{
    loan: Loan
    isMyDebt: boolean
    personName: string
  } | null>(null)

  if (!loans || loans.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-text-main mb-1">No commitments yet</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          Your future obligations and receivables will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {loans.map((loan) => {
          const isNonPlatformLoan = loan.lender_id === loan.borrower_id
          
          let isMyDebt: boolean
          let personName: string
          let isPlatformUser: boolean
          
          if (isNonPlatformLoan) {
            const extractedName = extractPersonName(loan.notes)
            personName = extractedName || 'Unknown'
            isMyDebt = loan.notes?.startsWith('From:') || false
            isPlatformUser = false
          } else {
            isMyDebt = loan.borrower_id === userId
            const otherPerson = isMyDebt ? loan.lender : loan.borrower
            personName = otherPerson?.real_name || otherPerson?.username || 'Unknown'
            isPlatformUser = true
          }
          
          const dueDate = parseISO(loan.due_date)
          const daysUntilDue = differenceInDays(dueDate, new Date())
          const isOverdue = isPast(dueDate) && loan.status !== 'repaid'
          const remainingAmount = Number(loan.remaining_amount || loan.amount)

          return (
            <div
              key={loan.id}
              className="bg-white rounded-xl border border-border-light p-4 shadow-sm"
            >
              {/* Header: Person & Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`size-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isPlatformUser 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isPlatformUser ? (
                      personName.substring(0, 2).toUpperCase()
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-text-main truncate">
                      {personName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {isPlatformUser ? (isMyDebt ? 'Personal Loan' : 'Loan Given') : 'External Contact'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border flex-shrink-0 ${
                  isMyDebt 
                    ? 'bg-danger/10 text-danger border-danger/20' 
                    : 'bg-success/10 text-success border-success/20'
                }`}>
                  {isMyDebt ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                  {isMyDebt ? 'Owe' : 'Receive'}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-3 pb-3 border-b border-border-light">
                <p className="text-xs text-text-secondary mb-1">Amount</p>
                <p className="text-2xl font-bold text-text-main">
                  PKR {remainingAmount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Due Date & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p className={`text-sm font-semibold ${isOverdue ? 'text-danger' : 'text-text-main'}`}>
                      {format(dueDate, 'MMM dd, yyyy')}
                    </p>
                    <p className={`text-xs ${
                      isOverdue ? 'text-danger' : daysUntilDue <= 7 ? 'text-orange-500' : 'text-text-secondary'
                    }`}>
                      {isOverdue 
                        ? `${Math.abs(daysUntilDue)} days ago` 
                        : `In ${daysUntilDue} days`
                      }
                    </p>
                  </div>
                </div>
                {isOverdue ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-danger bg-danger/5 px-2 py-1 rounded-full border border-danger/10">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue
                  </span>
                ) : loan.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <span className="size-2 rounded-full bg-primary"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <span className="size-2 rounded-full bg-yellow-400"></span>
                    Pending
                  </span>
                )}
              </div>

              {/* Settle Button */}
              <button
                onClick={() => setSelectedLoan({ loan, isMyDebt, personName })}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:brightness-95 text-text-main font-bold py-3 px-4 rounded-lg transition-all shadow-sm"
              >
                <Handshake className="w-4 h-4" />
                {isMyDebt ? 'Settle Loan' : 'Record Payment'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <th className="py-4 pl-2">Entity / Person</th>
              <th className="py-4">Type</th>
              <th className="py-4">Amount</th>
              <th className="py-4">Due Date</th>
              <th className="py-4">Status</th>
              <th className="py-4 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {loans.map((loan) => {
              const isNonPlatformLoan = loan.lender_id === loan.borrower_id
              
              let isMyDebt: boolean
              let personName: string
              let isPlatformUser: boolean
              
              if (isNonPlatformLoan) {
                const extractedName = extractPersonName(loan.notes)
                personName = extractedName || 'Unknown'
                isMyDebt = loan.notes?.startsWith('From:') || false
                isPlatformUser = false
              } else {
                isMyDebt = loan.borrower_id === userId
                const otherPerson = isMyDebt ? loan.lender : loan.borrower
                personName = otherPerson?.real_name || otherPerson?.username || 'Unknown'
                isPlatformUser = true
              }
              
              const dueDate = parseISO(loan.due_date)
              const daysUntilDue = differenceInDays(dueDate, new Date())
              const isOverdue = isPast(dueDate) && loan.status !== 'repaid'
              
              return (
                <tr 
                  key={loan.id} 
                  className="group hover:bg-background-light transition-colors border-b border-gray-50"
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        isPlatformUser 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isPlatformUser ? (
                          personName.substring(0, 2).toUpperCase()
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-text-main font-bold">
                          {personName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {isPlatformUser ? (isMyDebt ? 'Personal Loan' : 'Loan Given') : 'External Contact'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      isMyDebt 
                        ? 'bg-danger/10 text-danger border-danger/20' 
                        : 'bg-success/10 text-success border-success/20'
                    }`}>
                      {isMyDebt ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {isMyDebt ? 'Owe' : 'Receive'}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-text-main">
                    PKR {Number(loan.remaining_amount || loan.amount).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className={isOverdue ? 'text-danger font-bold' : 'text-text-main'}>
                        {format(dueDate, 'MMM dd, yyyy')}
                      </span>
                      <span className={`text-xs ${
                        isOverdue ? 'text-danger' : daysUntilDue <= 7 ? 'text-orange-500' : 'text-gray-400'
                      }`}>
                        {isOverdue 
                          ? `${Math.abs(daysUntilDue)} days ago` 
                          : `In ${daysUntilDue} days`
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-danger bg-danger/5 px-2 py-1 rounded-full border border-danger/10">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Overdue
                      </span>
                    ) : loan.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <span className="size-2 rounded-full bg-primary"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <span className="size-2 rounded-full bg-yellow-400"></span>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <button 
                      onClick={() => setSelectedLoan({ loan, isMyDebt, personName })}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <Handshake className="w-4 h-4" />
                      {isMyDebt ? 'Settle' : 'Record'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Repayment Modal */}
      {selectedLoan && (
        <LoanRepaymentModal
          loan={selectedLoan.loan}
          isOpen={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
          isMyDebt={selectedLoan.isMyDebt}
          personName={selectedLoan.personName}
        />
      )}
    </>
  )
}
