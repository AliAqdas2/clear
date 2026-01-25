'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoansTable from '@/components/loans/LoansTable'
import { Wallet, ArrowDown, ArrowUp, Handshake, RefreshCw, Calendar } from 'lucide-react'
import { startOfMonth, endOfMonth, addMonths, format, isWithinInterval, parseISO } from 'date-fns'

export default function FuturePage() {
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [data, setData] = useState<{
    loans: any[]
    // Next month breakdown
    loansToPay: number
    loansToReceive: number
    recurringExpenses: number
    recurringIncome: number
    // Totals
    totalComingIn: number
    totalGoingOut: number
    netCashFlow: number
    netCashFlowWithoutLoans: number
  } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      setUserId(user.id)

      // Calculate next month date range
      const now = new Date()
      const nextMonth = addMonths(now, 1)
      const nextMonthStart = startOfMonth(nextMonth)
      const nextMonthEnd = endOfMonth(nextMonth)
      const nextMonthStartStr = format(nextMonthStart, 'yyyy-MM-dd')
      const nextMonthEndStr = format(nextMonthEnd, 'yyyy-MM-dd')

      // Fetch loans where user is lender or borrower
      const { data: loans } = await supabase
        .from('loans')
        .select('*, lender:profiles!loans_lender_id_fkey(*), borrower:profiles!loans_borrower_id_fkey(*)')
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .neq('status', 'repaid')
        .order('due_date', { ascending: true })

      // Fetch recurring items
      const { data: recurringItems } = await supabase
        .from('recurring_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_date', { ascending: true })

      // Calculate next month's breakdown
      let loansToPay = 0
      let loansToReceive = 0
      let recurringExpenses = 0
      let recurringIncome = 0

      // Calculate loans due next month
      loans?.forEach((loan) => {
        const dueDate = parseISO(loan.due_date)
        const isNextMonth = isWithinInterval(dueDate, { start: nextMonthStart, end: nextMonthEnd })
        
        if (!isNextMonth) return

        const remainingAmount = Number(loan.remaining_amount || loan.amount)
        const isNonPlatformLoan = loan.lender_id === loan.borrower_id
        
        if (isNonPlatformLoan) {
          const isBorrowed = loan.notes?.startsWith('From:')
          if (isBorrowed) {
            loansToPay += remainingAmount
          } else {
            loansToReceive += remainingAmount
          }
        } else if (loan.borrower_id === user.id) {
          loansToPay += remainingAmount
        } else {
          loansToReceive += remainingAmount
        }
      })

      // Calculate recurring items due next month
      recurringItems?.forEach((item) => {
        const nextDate = parseISO(item.next_date)
        const isNextMonth = isWithinInterval(nextDate, { start: nextMonthStart, end: nextMonthEnd })
        
        if (!isNextMonth) return

        const amount = Number(item.amount)
        if (item.type === 'income' || item.type === 'salary') {
          recurringIncome += amount
        } else {
          recurringExpenses += amount
        }
      })

      // Calculate totals
      const totalComingIn = loansToReceive + recurringIncome
      const totalGoingOut = loansToPay + recurringExpenses
      const netCashFlow = totalComingIn - totalGoingOut
      const netCashFlowWithoutLoans = recurringIncome - recurringExpenses

      setData({
        loans: loans || [],
        loansToPay,
        loansToReceive,
        recurringExpenses,
        recurringIncome,
        totalComingIn,
        totalGoingOut,
        netCashFlow,
        netCashFlowWithoutLoans,
      })
      setLoading(false)
    }

  useEffect(() => {
    fetchData()
    
    // Listen for data refresh events
    const handleRefresh = () => {
      fetchData()
    }
    window.addEventListener('data-refresh', handleRefresh)
    
    return () => {
      window.removeEventListener('data-refresh', handleRefresh)
    }
  }, [refreshKey])

  const handleLoanChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading || !data || !userId) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const nextMonthName = format(addMonths(new Date(), 1), 'MMMM yyyy')

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 overflow-y-auto pb-24 md:pb-8 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-main">Next Month</h1>
          <div className="flex items-center gap-2 text-text-secondary font-medium">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse"></span>
            <span>Forecast for {nextMonthName}</span>
          </div>
        </div>
      </div>

      {/* Hero: Net Cash Flow */}
      <section className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-text-secondary text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span>Net Cash Flow</span>
        </h2>
        <div className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4 ${
          data.netCashFlow >= 0 ? 'text-success' : 'text-danger'
        }`}>
          {data.netCashFlow >= 0 ? '+' : ''}PKR {Math.abs(data.netCashFlow).toLocaleString()}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 text-sm">
          <p className={`px-3 py-1.5 rounded-full border font-medium ${
            data.netCashFlow >= 0 
              ? 'text-success bg-success/10 border-success/20' 
              : 'text-danger bg-danger/10 border-danger/20'
          }`}>
            {data.netCashFlow >= 0 ? '✅ Positive' : '⚠️ Deficit'}
          </p>
          <p className="text-text-secondary px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 font-medium">
            Without loans: {data.netCashFlowWithoutLoans >= 0 ? '+' : ''}PKR {Math.abs(data.netCashFlowWithoutLoans).toLocaleString()}
          </p>
        </div>
      </section>

      {/* Breakdown Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Coming In */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-text-secondary font-semibold text-sm">
            <span className="size-2 rounded-full bg-success"></span>
            COMING IN
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-success" />
                <span className="text-sm text-text-secondary">From Loans</span>
              </div>
              <span className="text-lg font-bold text-success">
                +PKR {data.loansToReceive.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-success" />
                <span className="text-sm text-text-secondary">Recurring Income</span>
              </div>
              <span className="text-lg font-bold text-success">
                +PKR {data.recurringIncome.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="font-bold text-text-main">Total</span>
              <span className="text-2xl font-black text-success">
                +PKR {data.totalComingIn.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Going Out */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-text-secondary font-semibold text-sm">
            <span className="size-2 rounded-full bg-danger"></span>
            GOING OUT
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-danger" />
                <span className="text-sm text-text-secondary">Loan Payments</span>
              </div>
              <span className="text-lg font-bold text-danger">
                -PKR {data.loansToPay.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-danger" />
                <span className="text-sm text-text-secondary">Recurring Expenses</span>
              </div>
              <span className="text-lg font-bold text-danger">
                -PKR {data.recurringExpenses.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="font-bold text-text-main">Total</span>
              <span className="text-2xl font-black text-danger">
                -PKR {data.totalGoingOut.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Commitments List Section */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-text-main">Commitments</h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">Upcoming payments and receivables</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <LoansTable loans={data.loans} userId={userId} onLoanChange={handleLoanChange} />
        </div>
      </section>
    </div>
  )
}
