'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import RecurringItemCard from '@/components/recurring/RecurringItemCard'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

export default function RecurringPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    incomeItems: any[]
    expenseItems: any[]
    totalIncome: number
    totalExpenses: number
    netAmount: number
    activeCount: number
    inactiveCount: number
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Fetch all recurring items
      const { data: recurringItems } = await supabase
        .from('recurring_items')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('next_date', { ascending: true })

      const items = recurringItems || []

      // Separate income and expenses
      const incomeItems = items.filter(
        (item) => item.type === 'income' || item.type === 'salary'
      )
      const expenseItems = items.filter(
        (item) => item.type !== 'income' && item.type !== 'salary'
      )

      // Calculate totals (only active items)
      const totalIncome = incomeItems
        .filter((item) => item.is_active)
        .reduce((sum, item) => sum + Number(item.amount), 0)
      const totalExpenses = expenseItems
        .filter((item) => item.is_active)
        .reduce((sum, item) => sum + Number(item.amount), 0)
      const netAmount = totalIncome - totalExpenses

      // Count active items
      const activeCount = items.filter((item) => item.is_active).length
      const inactiveCount = items.filter((item) => !item.is_active).length

      setData({
        incomeItems,
        expenseItems,
        totalIncome,
        totalExpenses,
        netAmount,
        activeCount,
        inactiveCount,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-main">Recurring Items</h1>
        <p className="text-text-secondary">
          Manage your recurring income and expenses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-secondary">Total Income</p>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-bold text-text-main">
            PKR {data.totalIncome.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {data.incomeItems.filter((i) => i.is_active).length} active
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-secondary">Total Expenses</p>
            <TrendingDown className="w-5 h-5 text-expense" />
          </div>
          <p className="text-2xl font-bold text-text-main">
            PKR {data.totalExpenses.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {data.expenseItems.filter((i) => i.is_active).length} active
          </p>
        </div>

        {/* Net Amount */}
        <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-secondary">Net Amount</p>
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <p className={`text-2xl font-bold ${data.netAmount >= 0 ? 'text-success' : 'text-expense'}`}>
            PKR {data.netAmount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {data.netAmount >= 0 ? 'Surplus' : 'Deficit'}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-secondary">Status</p>
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-text-main">{data.activeCount}</p>
          <p className="text-xs text-text-secondary mt-1">
            {data.activeCount} active, {data.inactiveCount} inactive
          </p>
        </div>
      </div>

      {/* Recurring Income Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <h2 className="text-xl font-bold text-text-main">Recurring Income</h2>
            <span className="text-sm text-text-secondary">
              ({data.incomeItems.length} {data.incomeItems.length === 1 ? 'item' : 'items'})
            </span>
          </div>
        </div>

        {data.incomeItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.incomeItems.map((item) => (
              <RecurringItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-border-light p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No recurring income yet</p>
            <p className="text-sm text-text-secondary mt-1">
              Add recurring income from the Add New button
            </p>
          </div>
        )}
      </section>

      {/* Recurring Expenses Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-expense" />
            <h2 className="text-xl font-bold text-text-main">Recurring Expenses</h2>
            <span className="text-sm text-text-secondary">
              ({data.expenseItems.length} {data.expenseItems.length === 1 ? 'item' : 'items'})
            </span>
          </div>
        </div>

        {data.expenseItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.expenseItems.map((item) => (
              <RecurringItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-border-light p-8 text-center">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No recurring expenses yet</p>
            <p className="text-sm text-text-secondary mt-1">
              Add recurring expenses from the Add New button
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
