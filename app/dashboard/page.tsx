import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { processRecurringItems } from '@/lib/utils/processRecurring'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown, 
  Handshake, 
  RefreshCw, 
  ArrowRight,
  Wallet,
  Calendar,
  Users
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8">Please log in to view your dashboard.</div>
  }

  // Process recurring items
  await processRecurringItems(supabase, user.id)

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Fetch this month's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(monthStart, 'yyyy-MM-dd'))
    .lte('date', format(monthEnd, 'yyyy-MM-dd'))

  // Calculate this month's totals
  let totalIncome = 0
  let totalSpent = 0
  transactions?.forEach((tx) => {
    if (tx.type === 'salary' || tx.type === 'loan_received' || tx.type === 'loan_repayment_received') {
      totalIncome += Number(tx.amount)
    } else {
      totalSpent += Number(tx.amount)
    }
  })
  const remainingThisMonth = totalIncome - totalSpent

  // Fetch loans
  const { data: loans } = await supabase
    .from('loans')
    .select('*, lender:profiles!loans_lender_id_fkey(*), borrower:profiles!loans_borrower_id_fkey(*)')
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
    .neq('status', 'repaid')

  // Calculate loan totals
  let totalOwedToMe = 0
  let totalIOwe = 0
  loans?.forEach((loan) => {
    const remaining = Number(loan.remaining_amount || loan.amount)
    const isNonPlatformLoan = loan.lender_id === loan.borrower_id
    
    if (isNonPlatformLoan) {
      const isBorrowed = loan.notes?.startsWith('From:')
      if (isBorrowed) {
        totalIOwe += remaining
      } else {
        totalOwedToMe += remaining
      }
    } else if (loan.borrower_id === user.id) {
      totalIOwe += remaining
    } else {
      totalOwedToMe += remaining
    }
  })

  // Fetch recurring items
  const { data: recurringItems } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Calculate recurring totals
  const recurringIncome = recurringItems
    ?.filter((item) => item.type === 'income' || item.type === 'salary')
    .reduce((sum, item) => sum + Number(item.amount), 0) || 0

  const recurringExpenses = recurringItems
    ?.filter((item) => item.type !== 'income' && item.type !== 'salary')
    .reduce((sum, item) => sum + Number(item.amount), 0) || 0

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-main">Summary</h1>
        <p className="text-text-secondary">
          Your financial overview at a glance
        </p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money Remaining This Month */}
        <Link
          href="/dashboard/this-month"
          className="group bg-white rounded-xl border border-border-light p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary">This Month</h3>
                <p className="text-xs text-text-secondary mt-0.5">Remaining balance</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <p className={`text-3xl font-bold ${remainingThisMonth >= 0 ? 'text-success' : 'text-expense'}`}>
            PKR {remainingThisMonth.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-success" />
              PKR {totalIncome.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-expense" />
              PKR {totalSpent.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </Link>

        {/* Loans Summary */}
        <Link
          href="/dashboard/friends"
          className="group bg-white rounded-xl border border-border-light p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Loans</h3>
                <p className="text-xs text-text-secondary mt-0.5">Active loans</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Owed to me</span>
              <span className="text-lg font-bold text-success">
                PKR {totalOwedToMe.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">I owe</span>
              <span className="text-lg font-bold text-expense">
                PKR {totalIOwe.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-border-light">
              <span className="text-xs text-text-secondary">
                {loans?.length || 0} active {loans?.length === 1 ? 'loan' : 'loans'}
              </span>
            </div>
          </div>
        </Link>

        {/* Recurring Income */}
        <Link
          href="/dashboard/recurring"
          className="group bg-white rounded-xl border border-border-light p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Recurring Income</h3>
                <p className="text-xs text-text-secondary mt-0.5">Monthly recurring</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-3xl font-bold text-success">
            PKR {recurringIncome.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            {recurringItems?.filter((i) => i.type === 'income' || i.type === 'salary').length || 0} active items
          </p>
        </Link>

        {/* Recurring Expenses */}
        <Link
          href="/dashboard/recurring"
          className="group bg-white rounded-xl border border-border-light p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-expense/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-expense" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Recurring Expenses</h3>
                <p className="text-xs text-text-secondary mt-0.5">Monthly recurring</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-3xl font-bold text-expense">
            PKR {recurringExpenses.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            {recurringItems?.filter((i) => i.type !== 'income' && i.type !== 'salary').length || 0} active items
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/this-month"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border-light hover:border-primary/50 transition-all group"
        >
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium text-text-main group-hover:text-primary transition-colors">View This Month</span>
          <ArrowRight className="w-4 h-4 text-text-secondary ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/dashboard/future"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border-light hover:border-primary/50 transition-all group"
        >
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium text-text-main group-hover:text-primary transition-colors">View Future</span>
          <ArrowRight className="w-4 h-4 text-text-secondary ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          href="/dashboard/recurring"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border-light hover:border-primary/50 transition-all group"
        >
          <RefreshCw className="w-5 h-5 text-primary" />
          <span className="font-medium text-text-main group-hover:text-primary transition-colors">Manage Recurring</span>
          <ArrowRight className="w-4 h-4 text-text-secondary ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  )
}
