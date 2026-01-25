import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { format, startOfMonth, endOfMonth, addMonths, isWithinInterval, parseISO } from 'date-fns'
import { processRecurringItems } from '@/lib/utils/processRecurring'

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file.')
  }
  return new GoogleGenerativeAI(apiKey)
}

type PageContext = 'dashboard' | 'this-month' | 'future'

interface FinancialContext {
  summary: string
  transactions?: any[]
  loans?: any[]
  recurringItems?: any[]
}

async function fetchDashboardContext(supabase: any, userId: string): Promise<FinancialContext> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Process recurring items
  await processRecurringItems(supabase, userId)

  // Fetch this month's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(monthStart, 'yyyy-MM-dd'))
    .lte('date', format(monthEnd, 'yyyy-MM-dd'))

  // Calculate totals
  let totalIncome = 0
  let totalSpent = 0
  transactions?.forEach((tx: any) => {
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
    .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
    .neq('status', 'repaid')

  let totalOwedToMe = 0
  let totalIOwe = 0
  loans?.forEach((loan: any) => {
    const remaining = Number(loan.remaining_amount || loan.amount)
    const isNonPlatformLoan = loan.lender_id === loan.borrower_id
    
    if (isNonPlatformLoan) {
      const isBorrowed = loan.notes?.startsWith('From:')
      if (isBorrowed) {
        totalIOwe += remaining
      } else {
        totalOwedToMe += remaining
      }
    } else if (loan.borrower_id === userId) {
      totalIOwe += remaining
    } else {
      totalOwedToMe += remaining
    }
  })

  // Fetch recurring items
  const { data: recurringItems } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  const recurringIncome = recurringItems
    ?.filter((item: any) => item.type === 'income' || item.type === 'salary')
    .reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0

  const recurringExpenses = recurringItems
    ?.filter((item: any) => item.type !== 'income' && item.type !== 'salary')
    .reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0

  const summary = `Financial Summary:
- Remaining this month: PKR ${remainingThisMonth.toLocaleString()}
- Total income this month: PKR ${totalIncome.toLocaleString()}
- Total spent this month: PKR ${totalSpent.toLocaleString()}
- Loans: Owed to me: PKR ${totalOwedToMe.toLocaleString()}, I owe: PKR ${totalIOwe.toLocaleString()}
- Recurring income: PKR ${recurringIncome.toLocaleString()}
- Recurring expenses: PKR ${recurringExpenses.toLocaleString()}
- Active loans: ${loans?.length || 0}
- Active recurring items: ${recurringItems?.length || 0}`

  return { summary, transactions, loans, recurringItems }
}

async function fetchThisMonthContext(supabase: any, userId: string): Promise<FinancialContext> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const daysRemaining = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Fetch transactions for this month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(monthStart, 'yyyy-MM-dd'))
    .lte('date', format(monthEnd, 'yyyy-MM-dd'))
    .order('date', { ascending: false })

  // Calculate totals
  let totalIncome = 0
  let totalSpent = 0
  transactions?.forEach((tx: any) => {
    if (tx.type === 'salary' || tx.type === 'loan_received' || tx.type === 'loan_repayment_received') {
      totalIncome += Number(tx.amount)
    } else {
      totalSpent += Number(tx.amount)
    }
  })
  const remaining = totalIncome - totalSpent

  const recentTransactions = transactions?.slice(0, 10).map((tx: any) => ({
    type: tx.type,
    amount: Number(tx.amount),
    category: tx.category,
    description: tx.description,
    date: tx.date,
  }))

  const summary = `Current Month Financial Status (${format(now, 'MMMM yyyy')}):
- Remaining balance: PKR ${remaining.toLocaleString()}
- Total income: PKR ${totalIncome.toLocaleString()}
- Total expenses: PKR ${totalSpent.toLocaleString()}
- Days remaining in month: ${daysRemaining}
- Total transactions: ${transactions?.length || 0}

Recent transactions:
${recentTransactions?.map((tx: any) => 
  `  - ${tx.type}: PKR ${tx.amount.toLocaleString()} (${tx.category || 'N/A'}) - ${tx.description || 'No description'} on ${tx.date}`
).join('\n') || '  No recent transactions'}`

  return { summary, transactions }
}

async function fetchFutureContext(supabase: any, userId: string): Promise<FinancialContext> {
  const now = new Date()
  const nextMonth = addMonths(now, 1)
  const nextMonthStart = startOfMonth(nextMonth)
  const nextMonthEnd = endOfMonth(nextMonth)

  // Fetch loans
  const { data: loans } = await supabase
    .from('loans')
    .select('*, lender:profiles!loans_lender_id_fkey(*), borrower:profiles!loans_borrower_id_fkey(*)')
    .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
    .neq('status', 'repaid')
    .order('due_date', { ascending: true })

  // Fetch recurring items
  const { data: recurringItems } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('next_date', { ascending: true })

  // Calculate next month's breakdown
  let loansToPay = 0
  let loansToReceive = 0
  let recurringExpenses = 0
  let recurringIncome = 0

  const loansDueNextMonth: any[] = []
  loans?.forEach((loan: any) => {
    const dueDate = parseISO(loan.due_date)
    const isNextMonth = isWithinInterval(dueDate, { start: nextMonthStart, end: nextMonthEnd })
    
    if (!isNextMonth) return

    const remainingAmount = Number(loan.remaining_amount || loan.amount)
    const isNonPlatformLoan = loan.lender_id === loan.borrower_id
    
    if (isNonPlatformLoan) {
      const isBorrowed = loan.notes?.startsWith('From:')
      if (isBorrowed) {
        loansToPay += remainingAmount
        loansDueNextMonth.push({ type: 'pay', amount: remainingAmount, person: loan.notes?.replace('From: ', '') || 'Non-platform', dueDate: loan.due_date })
      } else {
        loansToReceive += remainingAmount
        loansDueNextMonth.push({ type: 'receive', amount: remainingAmount, person: loan.notes?.replace('To: ', '') || 'Non-platform', dueDate: loan.due_date })
      }
    } else if (loan.borrower_id === userId) {
      loansToPay += remainingAmount
      loansDueNextMonth.push({ type: 'pay', amount: remainingAmount, person: loan.lender?.real_name || loan.lender?.username || 'Unknown', dueDate: loan.due_date })
    } else {
      loansToReceive += remainingAmount
      loansDueNextMonth.push({ type: 'receive', amount: remainingAmount, person: loan.borrower?.real_name || loan.borrower?.username || 'Unknown', dueDate: loan.due_date })
    }
  })

  const recurringDueNextMonth: any[] = []
  recurringItems?.forEach((item: any) => {
    const nextDate = parseISO(item.next_date)
    const isNextMonth = isWithinInterval(nextDate, { start: nextMonthStart, end: nextMonthEnd })
    
    if (!isNextMonth) return

    const amount = Number(item.amount)
    if (item.type === 'income' || item.type === 'salary') {
      recurringIncome += amount
      recurringDueNextMonth.push({ type: 'income', amount, category: item.category, description: item.description, date: item.next_date })
    } else {
      recurringExpenses += amount
      recurringDueNextMonth.push({ type: 'expense', amount, category: item.category, description: item.description, date: item.next_date })
    }
  })

  const totalComingIn = loansToReceive + recurringIncome
  const totalGoingOut = loansToPay + recurringExpenses
  const netCashFlow = totalComingIn - totalGoingOut
  const netCashFlowWithoutLoans = recurringIncome - recurringExpenses

  const summary = `Next Month Financial Forecast (${format(nextMonth, 'MMMM yyyy')}):
- Net cash flow: PKR ${netCashFlow.toLocaleString()} ${netCashFlow >= 0 ? '(positive)' : '(deficit)'}
- Net cash flow (without loans): PKR ${netCashFlowWithoutLoans.toLocaleString()}
- Total coming in: PKR ${totalComingIn.toLocaleString()}
  - From loans: PKR ${loansToReceive.toLocaleString()}
  - Recurring income: PKR ${recurringIncome.toLocaleString()}
- Total going out: PKR ${totalGoingOut.toLocaleString()}
  - Loan payments: PKR ${loansToPay.toLocaleString()}
  - Recurring expenses: PKR ${recurringExpenses.toLocaleString()}

Loans due next month:
${loansDueNextMonth.length > 0 ? loansDueNextMonth.map((loan: any) => 
  `  - ${loan.type === 'pay' ? 'Pay' : 'Receive'} PKR ${loan.amount.toLocaleString()} ${loan.type === 'pay' ? 'to' : 'from'} ${loan.person} (due ${loan.dueDate})`
).join('\n') : '  No loans due next month'}

Recurring items due next month:
${recurringDueNextMonth.length > 0 ? recurringDueNextMonth.map((item: any) => 
  `  - ${item.type === 'income' ? 'Income' : 'Expense'}: PKR ${item.amount.toLocaleString()} (${item.category || 'N/A'}) - ${item.description || 'No description'} on ${item.date}`
).join('\n') : '  No recurring items due next month'}`

  return { summary, loans, recurringItems }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const body = await request.json()
    const { message, pageContext } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!pageContext || !['dashboard', 'this-month', 'future'].includes(pageContext)) {
      return new Response(JSON.stringify({ error: 'Invalid page context' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch financial context based on page
    let financialContext: FinancialContext
    switch (pageContext as PageContext) {
      case 'dashboard':
        financialContext = await fetchDashboardContext(supabase, user.id)
        break
      case 'this-month':
        financialContext = await fetchThisMonthContext(supabase, user.id)
        break
      case 'future':
        financialContext = await fetchFutureContext(supabase, user.id)
        break
    }

    // Build prompt
    const prompt = `You are a helpful and friendly financial advisor for a personal finance management app called "Clear". Your role is to help users understand their financial situation and make informed decisions.

${financialContext.summary}

User's question: ${message}

Please provide helpful, actionable advice. Be specific about amounts in PKR (Pakistani Rupees). If the user asks about affordability or whether they can afford something, analyze their current/future cash flow based on the financial data provided. Be conversational and friendly, but also precise with numbers. Keep your response concise but informative.`

    // Initialize Gemini model
    const genAI = getGenAI()
    // Use gemini-2.5-flash (latest fast model with thinking capabilities) or gemini-1.5-pro for better quality
    // Available models: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const model = genAI.getGenerativeModel({ model: modelName })

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(prompt)
          
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`))
            }
          }
          
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('Gemini API error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message || 'Failed to generate response' })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('API route error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
