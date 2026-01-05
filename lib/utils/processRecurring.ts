import { SupabaseClient } from '@supabase/supabase-js'
import { format, addMonths, isBefore, startOfMonth } from 'date-fns'

/**
 * Process recurring items and create transactions for the current month
 * This should be called when a user visits the dashboard or via a cron job
 */
export async function processRecurringItems(supabase: SupabaseClient, userId: string) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const today = format(now, 'yyyy-MM-dd')

  // Get all active recurring items for this user that are due
  const { data: recurringItems, error } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_date', today)

  if (error) {
    console.error('Error fetching recurring items:', error)
    return { processed: 0, error }
  }

  if (!recurringItems || recurringItems.length === 0) {
    return { processed: 0, error: null }
  }

  let processed = 0

  for (const item of recurringItems) {
    // Check if a transaction already exists for this recurring item this month
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('category', item.category)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()

    // If no transaction exists for this month, create one
    if (!existingTx) {
      const transactionType = item.type === 'income' || item.type === 'salary' ? 'salary' : 'expense'
      
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: transactionType,
        amount: item.amount,
        category: item.category,
        description: item.description || `Recurring: ${item.category}`,
        date: format(startOfMonth(now), 'yyyy-MM-dd'), // First of the month
        month: currentMonth,
        year: currentYear,
      })

      if (!insertError) {
        processed++
        
        // Update next_date to next month
        const nextDate = addMonths(new Date(item.next_date), 1)
        await supabase
          .from('recurring_items')
          .update({ next_date: format(nextDate, 'yyyy-MM-dd') })
          .eq('id', item.id)
      }
    } else {
      // Transaction exists, just update next_date if needed
      const nextDate = new Date(item.next_date)
      if (isBefore(nextDate, now)) {
        const newNextDate = addMonths(nextDate, 1)
        await supabase
          .from('recurring_items')
          .update({ next_date: format(newNextDate, 'yyyy-MM-dd') })
          .eq('id', item.id)
      }
    }
  }

  return { processed, error: null }
}

