'use client'

import { useState } from 'react'
import ExpenseForm from './ExpenseForm'
import IncomeForm from './IncomeForm'
import LoanForm from './LoanForm'
import RecurringForm from './RecurringForm'
import { X, Wallet, TrendingUp, Handshake, RefreshCw } from 'lucide-react'

interface AddModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalStep = 'select' | 'expense' | 'income' | 'loan' | 'recurring'

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('select')

  if (!isOpen) return null

  const handleClose = () => {
    setCurrentStep('select')
    onClose()
  }

  const handleSuccess = () => {
    setCurrentStep('select')
    onClose()
    // Refresh the page data
    window.location.reload()
  }

  const options = [
    {
      id: 'expense',
      icon: Wallet,
      iconBg: 'bg-red-50 text-red-600',
      title: 'Expense',
      description: 'Log daily spending',
      shortcut: 'E',
    },
    {
      id: 'income',
      icon: TrendingUp,
      iconBg: 'bg-green-50 text-primary',
      title: 'Income',
      description: 'Record earnings',
      shortcut: 'I',
    },
    {
      id: 'loan',
      icon: Handshake,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Social Loan',
      description: 'Lend or borrow with friends',
      shortcut: 'L',
    },
    {
      id: 'recurring',
      icon: RefreshCw,
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'Recurring',
      description: 'Subscriptions & bills',
      shortcut: 'R',
    },
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={handleClose}
      />
      
      {/* Modal Card - Mobile: Full height bottom sheet, Desktop: Centered */}
      <div 
        className="relative w-full sm:max-w-[640px] transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section - Sticky on mobile */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-text-main">
              {currentStep === 'select' ? 'What would you like to add?' : 
               currentStep === 'expense' ? 'Add New Expense' :
               currentStep === 'income' ? 'Add Income' :
               currentStep === 'loan' ? 'Create Loan' :
               'Add Recurring Item'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              {currentStep === 'select' 
                ? 'Select a transaction type to continue'
                : 'Fill in the details below'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentStep === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {options.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setCurrentStep(option.id as ModalStep)}
                    className="group relative flex flex-col gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 text-left transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg ${option.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <span className="inline-flex h-5 sm:h-6 min-w-[20px] sm:min-w-[24px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 sm:px-1.5 text-[10px] sm:text-xs font-bold text-gray-400">
                        {option.shortcut}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-base sm:text-lg">{option.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {currentStep === 'expense' && (
            <ExpenseForm 
              onSuccess={handleSuccess} 
              onCancel={() => setCurrentStep('select')} 
            />
          )}

          {currentStep === 'income' && (
            <IncomeForm 
              onSuccess={handleSuccess} 
              onCancel={() => setCurrentStep('select')} 
            />
          )}

          {currentStep === 'loan' && (
            <LoanForm 
              onSuccess={handleSuccess} 
              onCancel={() => setCurrentStep('select')} 
            />
          )}

          {currentStep === 'recurring' && (
            <RecurringForm 
              onSuccess={handleSuccess} 
              onCancel={() => setCurrentStep('select')} 
            />
          )}
        </div>

        {/* Footer Section - only for select step */}
        {currentStep === 'select' && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end flex-shrink-0 border-t border-gray-100">
            <button 
              onClick={handleClose}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-11 px-4 bg-transparent text-text-main text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transition-colors active:scale-[0.98]"
            >
              <span className="truncate">Cancel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
