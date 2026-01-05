'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoansTable from '@/components/loans/LoansTable'
import { TrendingDown, ArrowDown, ArrowUp, Scale } from 'lucide-react'

export default function FuturePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    loans: any[]
    totalLoansOnMe: number
    willReceive: number
    mustPay: number
    netPosition: number
    debtPercentage: number
  } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      setUserId(user.id)

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
        .order('next_date', { ascending: true })

      // Calculate totals
      let totalLoansOnMe = 0
      let willReceive = 0
      let mustPay = 0

      loans?.forEach((loan) => {
        const remainingAmount = Number(loan.remaining_amount || loan.amount)
        const isNonPlatformLoan = loan.lender_id === loan.borrower_id
        
        if (isNonPlatformLoan) {
          const isBorrowed = loan.notes?.startsWith('From:')
          if (isBorrowed) {
            totalLoansOnMe += remainingAmount
            mustPay += remainingAmount
          } else {
            willReceive += remainingAmount
          }
        } else if (loan.borrower_id === user.id) {
          totalLoansOnMe += remainingAmount
          mustPay += remainingAmount
        } else {
          willReceive += remainingAmount
        }
      })

      // Add recurring items
      recurringItems?.forEach((item) => {
        if (item.type === 'income' || item.type === 'salary') {
          willReceive += Number(item.amount)
        } else {
          mustPay += Number(item.amount)
        }
      })

      const netPosition = willReceive - mustPay
      const maxDebt = Math.max(totalLoansOnMe, willReceive, 1)
      const debtPercentage = (totalLoansOnMe / maxDebt) * 100 * 0.75

      setData({
        loans: loans || [],
        totalLoansOnMe,
        willReceive,
        mustPay,
        netPosition,
        debtPercentage,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading || !data || !userId) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="h-48 w-48 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
      {/* Header Visualization Section */}
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full">
        {/* Debt Meter - Responsive, matches other pages */}
        <div className="relative flex items-center justify-center w-full aspect-square max-w-[240px] sm:max-w-[280px] md:max-w-[320px]">
          <div className="absolute inset-0 bg-danger/10 blur-3xl rounded-full"></div>
          
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <circle
              className="text-gray-200"
              cx="50"
              cy="50"
              fill="none"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-danger transition-all duration-1000 ease-out"
              cx="50"
              cy="50"
              fill="none"
              r="45"
              stroke="currentColor"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * Math.min(data.debtPercentage, 75)) / 100}
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="p-2 sm:p-3 bg-danger/10 rounded-full mb-1 sm:mb-2">
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-danger" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">
              Loans on Me
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-text-main tracking-tight">
              {data.totalLoansOnMe >= 1000 ? `${(data.totalLoansOnMe / 1000).toFixed(0)}k` : data.totalLoansOnMe.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-danger mt-1">PKR Total Exposure</span>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col items-center md:items-start transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-text-secondary">Will Receive</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-text-main mb-1">
              <span className="text-success">+</span> {data.willReceive.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-success bg-success/5 px-2 py-0.5 sm:py-1 rounded-full">
              Expected income
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col items-center md:items-start transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-danger/5 rounded-bl-full -mr-2 -mt-2"></div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-text-secondary">Must Pay</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-text-main mb-1">
              <span className="text-danger">-</span> {data.mustPay.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-danger bg-danger/5 px-2 py-0.5 sm:py-1 rounded-full">
              Upcoming obligations
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-info/20 shadow-md flex flex-col items-center md:items-start transition-transform hover:-translate-y-1 duration-300 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-info rounded-l-xl"></div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-text-secondary">Net Future Position</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold mb-1 ${data.netPosition >= 0 ? 'text-info' : 'text-danger'}`}>
              {data.netPosition >= 0 ? '+' : ''} {data.netPosition.toLocaleString()}
            </div>
            <p className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-full ${
              data.netPosition >= 0 ? 'text-info bg-info/5' : 'text-danger bg-danger/5'
            }`}>
              {data.netPosition >= 0 ? 'Healthy Liquidity' : 'Deficit Warning'}
            </p>
          </div>
        </div>
      </div>

      {/* Commitments List Section */}
      <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-text-main">Commitments List</h3>
            <p className="text-xs sm:text-sm text-text-secondary">Upcoming payments and receivables.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-text-main text-xs sm:text-sm font-bold shadow-sm transition-colors hover:brightness-95">
              All
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-background-light text-text-secondary text-xs sm:text-sm font-medium border border-transparent hover:border-gray-200 transition-all">
              Owed by Me
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-background-light text-text-secondary text-xs sm:text-sm font-medium border border-transparent hover:border-gray-200 transition-all">
              Owed to Me
            </button>
          </div>
        </div>

        {/* Loans List - Mobile cards, Desktop table */}
        <LoansTable loans={data.loans} userId={userId} />
      </div>
    </div>
  )
}
