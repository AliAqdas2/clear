import { format, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns'

export function getDaysRemainingInMonth(): number {
  const now = new Date()
  const endOfCurrentMonth = endOfMonth(now)
  return differenceInDays(endOfCurrentMonth, now) + 1
}

export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function calculateRemainingThisMonth(transactions: any[]): number {
  let income = 0
  let expenses = 0

  transactions.forEach((tx) => {
    if (['income', 'loan_received', 'loan_repayment_received', 'salary'].includes(tx.type)) {
      income += parseFloat(tx.amount.toString())
    } else if (['expense', 'loan_given', 'loan_repayment'].includes(tx.type)) {
      expenses += parseFloat(tx.amount.toString())
    }
  })

  return income - expenses
}

export function calculateIncomeThisMonth(transactions: any[]): number {
  return transactions
    .filter((tx) => ['income', 'loan_received', 'loan_repayment_received', 'salary'].includes(tx.type))
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
}

export function calculateSpentThisMonth(transactions: any[]): number {
  return transactions
    .filter((tx) => ['expense', 'loan_given', 'loan_repayment'].includes(tx.type))
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
}

export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  return `${currency} ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

