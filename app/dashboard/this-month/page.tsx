'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns'
import TransactionsTable from '@/components/transactions/TransactionsTable'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CalendarDays, Info, Receipt } from 'lucide-react'

export default function ThisMonthPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    transactions: any[]
    totalIncome: number
    totalSpent: number
    remaining: number
    daysRemaining: number
    progressPercent: number
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const now = new Date()
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)
      const daysRemaining = differenceInDays(monthEnd, now)
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
      const progressPercent = ((daysInMonth - daysRemaining) / daysInMonth) * 100

      // Fetch transactions for this month
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: false })

      // Calculate totals
      let totalIncome = 0
      let totalSpent = 0

      transactions?.forEach((tx) => {
        if (tx.type === 'salary' || tx.type === 'loan_received' || tx.type === 'loan_repayment_received') {
          totalIncome += Number(tx.amount)
        } else {
          totalSpent += Number(tx.amount)
        }
      })

      const remaining = totalIncome - totalSpent

      setData({
        transactions: transactions || [],
        totalIncome,
        totalSpent,
        remaining,
        daysRemaining,
        progressPercent,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto overflow-x-hidden pb-24 md:pb-8">
      {/* Page Heading & Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-text-main">This Month</h1>
          <div className="flex items-center gap-2 text-text-secondary font-medium">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse"></span>
            <span>Reality Mode</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-text-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold px-2">{format(new Date(), 'MMMM yyyy')}</span>
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-text-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero: Remaining Balance */}
      <section className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-text-secondary text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
          <span>💰 Remaining This Month</span>
          <span title="Calculated as (Income + Loans Received) - (Expenses + Loans Given)">
            <Info className="w-4 h-4 cursor-help" />
          </span>
        </h2>
        <div className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4 ${
          data.remaining >= 0 ? 'text-text-main' : 'text-expense'
        }`}>
          PKR {data.remaining.toLocaleString()}
        </div>
        {data.remaining > 0 && (
          <p className="text-sm text-text-secondary font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            On track to save PKR {Math.floor(data.remaining * 0.3).toLocaleString()}
          </p>
        )}
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm">
            <span className="size-2 rounded-full bg-primary"></span>
            INCOME
          </div>
          <div className="text-2xl font-bold text-text-main tracking-tight">
            PKR {data.totalIncome.toLocaleString()}
          </div>
          <div className="text-xs text-primary font-medium mt-auto">This month</div>
        </div>

        {/* Spent Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-16 h-16 text-expense" />
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm">
            <span className="size-2 rounded-full bg-expense"></span>
            SPENT
          </div>
          <div className="text-2xl font-bold text-text-main tracking-tight">
            PKR {data.totalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-expense font-medium mt-auto">This month</div>
        </div>

        {/* Days Left Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays className="w-16 h-16 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-semibold text-sm">
            <span className="size-2 rounded-full bg-gray-400"></span>
            TIME LEFT
          </div>
          <div className="text-2xl font-bold text-text-main tracking-tight">
            {data.daysRemaining} Days
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto">
            <div 
              className="bg-gray-400 h-1.5 rounded-full transition-all" 
              style={{ width: `${data.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="flex flex-col gap-4 overflow-x-hidden">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-text-main">Transaction List</h3>
          <button className="text-primary text-sm font-bold hover:underline">View All</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <TransactionsTable transactions={data.transactions} />
        </div>
      </section>
    </div>
  )
}
