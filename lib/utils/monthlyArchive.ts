import { SupabaseClient } from '@supabase/supabase-js'
import { format, startOfMonth, endOfMonth } from 'date-fns'

/**
 * Archive current month's data into monthly_snapshots table
 * This should be called at the end of each month or when starting a new month
 */
export async function archiveMonthlySnapshot(supabase: SupabaseClient, userId: string) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Fetch all transactions for the current month
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(monthStart, 'yyyy-MM-dd'))
    .lte('date', format(monthEnd, 'yyyy-MM-dd'))

  if (txError) {
    console.error('Error fetching transactions for archiving:', txError)
    return { error: txError }
  }

  if (!transactions || transactions.length === 0) {
    // No transactions to archive
    return { success: true, message: 'No transactions to archive' }
  }

  // Calculate totals
  let totalIncome = 0
  let totalExpenses = 0

  transactions.forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'salary' || tx.type === 'loan_received' || tx.type === 'loan_repayment_received' || tx.type === 'income') {
      totalIncome += amount
    } else {
      totalExpenses += amount
    }
  })

  const remainingBalance = totalIncome - totalExpenses

  // Check if snapshot already exists for this month
  const { data: existing } = await supabase
    .from('monthly_snapshots')
    .select('id')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing) {
    // Update existing snapshot
    const { error: updateError } = await supabase
      .from('monthly_snapshots')
      .update({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        remaining_balance: remainingBalance,
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating monthly snapshot:', updateError)
      return { error: updateError }
    }

    return { success: true, message: 'Monthly snapshot updated' }
  } else {
    // Create new snapshot
    const { error: insertError } = await supabase
      .from('monthly_snapshots')
      .insert({
        user_id: userId,
        month,
        year,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        remaining_balance: remainingBalance,
      })

    if (insertError) {
      console.error('Error creating monthly snapshot:', insertError)
      return { error: insertError }
    }

    return { success: true, message: 'Monthly snapshot created' }
  }
}

