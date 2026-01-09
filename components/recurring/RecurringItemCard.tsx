'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Calendar, RefreshCw, Edit, Trash2, Power, PowerOff, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import EditRecurringModal from './EditRecurringModal'

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
  created_at: string
}

interface RecurringItemCardProps {
  item: RecurringItem
  onItemChange?: () => void
}

export default function RecurringItemCard({ item, onItemChange }: RecurringItemCardProps) {
  const [loading, setLoading] = useState(false)
  const [isActive, setIsActive] = useState(item.is_active)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isIncome = item.type === 'income' || item.type === 'salary'

  const handleToggleActive = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('recurring_items')
      .update({ is_active: !isActive })
      .eq('id', item.id)

    if (!error) {
      setIsActive(!isActive)
      if (onItemChange) {
        onItemChange()
      } else {
        router.refresh()
      }
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recurring item?')) return

    setLoading(true)
    const { error } = await supabase
      .from('recurring_items')
      .delete()
      .eq('id', item.id)

    if (!error) {
      if (onItemChange) {
        onItemChange()
      } else {
        router.refresh()
      }
    }
    setLoading(false)
  }

  const getFrequencyLabel = () => {
    switch (item.frequency) {
      case 'monthly':
        return 'Monthly'
      case 'weekly':
        return 'Weekly'
      case 'yearly':
        return 'Yearly'
      default:
        return item.frequency
    }
  }

  const getTypeLabel = () => {
    const typeMap: Record<string, string> = {
      income: 'Income',
      salary: 'Salary',
      expense: 'Expense',
      rent: 'Rent',
      bills: 'Bills',
      transport: 'Transport',
      subscription: 'Subscription',
      utilities: 'Utilities',
      insurance: 'Insurance',
      internet: 'Internet',
    }
    return typeMap[item.type] || item.type
  }

  const nextDate = parseISO(item.next_date)
  const isOverdue = nextDate < new Date() && isActive

  return (
    <div
      className={`bg-white rounded-xl border ${
        isActive ? 'border-border-light' : 'border-gray-200 opacity-60'
      } p-5 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon and Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`size-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isIncome ? 'bg-success/10' : 'bg-expense/10'
            }`}
          >
            {isIncome ? (
              <TrendingUp className={`w-6 h-6 ${isIncome ? 'text-success' : 'text-expense'}`} />
            ) : (
              <TrendingDown className="w-6 h-6 text-expense" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-text-main truncate">
                {item.description || item.category || getTypeLabel()}
              </h3>
              {!isActive && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                  Inactive
                </span>
              )}
              {isOverdue && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  Overdue
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="font-semibold text-text-main">
                PKR {Number(item.amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                {getFrequencyLabel()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Next: {format(nextDate, 'MMM d, yyyy')}
              </span>
              {item.category && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {item.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleActive}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                : 'bg-primary/10 hover:bg-primary/20 text-primary'
            }`}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            {isActive ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditRecurringModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onItemChange}
      />
    </div>
  )
}

