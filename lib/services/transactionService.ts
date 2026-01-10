import { supabase } from '@/lib/supabase/client'
import type { Transaction, TransactionInput } from '@/types/transaction'
import { calculatePeriod } from '@/types/period'

// Helper function to safely convert string/number to number
const toNumber = (value: string | number): number => {
  return typeof value === 'string' ? parseFloat(value) : value
}

export const transactionService = {
  // Get transactions with filtering
  async getTransactions(
    profileId: string,
    options?: {
      includeArchived?: boolean
      startDate?: string
      endDate?: string
      category?: string
      type?: 'income' | 'expense' | 'transfer'
      period?: string
    }
  ): Promise<Transaction[]> {
    // Validate profileId
    if (!profileId || profileId === 'temp-profile-id') {
      console.warn('Invalid profileId provided to getTransactions:', profileId)
      return []
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!options?.includeArchived) {
      query = query.eq('archived', false)
    }

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    if (options?.period) {
      query = query.eq('period', options.period)
    }

    const { data, error } = await query

    if (error) {
      // Provide more context in error messages
      console.error('Supabase query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        profileId
      })
      throw error
    }
    return data || []
  },

  // Add transaction with side effects
  async addTransaction(
    profileId: string,
    transaction: TransactionInput
  ): Promise<Transaction> {
    // Get user settings for period calculation
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('custom_period_start_day')
      .eq('profile_id', profileId)
      .single()

    // Handle case where settings don't exist yet (not an error)
    const periodStartDay = settings?.custom_period_start_day || 1
    const period = calculatePeriod(transaction.date, periodStartDay)

    // Round amount to 2 decimals
    const amount = Math.round(transaction.amount * 100) / 100

    // Validate amount
    if (amount <= 0 || amount > 9999999.99) {
      throw new Error('Amount must be between 0.01 and 9,999,999.99')
    }

    // Validate description length
    if (transaction.description.length > 50) {
      throw new Error('Description must be 50 characters or less')
    }

    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        profile_id: profileId,
        amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        date: transaction.date,
        is_recurring: transaction.is_recurring || false,
        recurring_type: transaction.recurring_type,
        from_category: transaction.from_category,
        to_category: transaction.to_category,
        period
      })
      .select()
      .single()

    if (error) throw error

    // Handle side effects
    if (transaction.type === 'expense') {
      await this.updateBudgetSpent(profileId, transaction.category, period, amount)
    } else if (transaction.type === 'transfer') {
      await this.handleTransferToBudget(profileId, transaction, period, amount)
    }

    return data
  },

  // Update transaction with side effects
  async updateTransaction(
    profileId: string,
    transactionId: string,
    updates: Partial<TransactionInput>
  ): Promise<Transaction> {
    // Get current transaction
    const { data: currentTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('profile_id', profileId)
      .single()

    if (fetchError) throw fetchError
    if (!currentTransaction) throw new Error('Transaction not found')

    // Get settings for period calculation
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('custom_period_start_day')
      .eq('profile_id', profileId)
      .single()

    // Handle case where settings don't exist yet (not an error)
    const periodStartDay = settings?.custom_period_start_day || 1

    // Prepare update data
    const updateData: any = {}

    if (updates.amount !== undefined) {
      const amount = Math.round(updates.amount * 100) / 100
      if (amount <= 0 || amount > 9999999.99) {
        throw new Error('Amount must be between 0.01 and 9,999,999.99')
      }
      updateData.amount = amount
    }

    if (updates.description !== undefined) {
      if (updates.description.length > 50) {
        throw new Error('Description must be 50 characters or less')
      }
      updateData.description = updates.description
    }

    if (updates.category !== undefined) {
      updateData.category = updates.category
    }

    if (updates.type !== undefined) {
      updateData.type = updates.type
    }

    if (updates.date !== undefined) {
      updateData.date = updates.date
      updateData.period = calculatePeriod(updates.date, periodStartDay)
    }

    // Handle transfer fields
    if (updates.type === 'transfer') {
      if (updates.from_category) updateData.from_category = updates.from_category
      if (updates.to_category) updateData.to_category = updates.to_category
    } else {
      updateData.from_category = null
      updateData.to_category = null
    }

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('profile_id', profileId)
      .select()
      .single()

    if (error) throw error

    // Recalculate budgets if expense changed
    if (currentTransaction.type === 'expense' || updates.type === 'expense') {
      const oldPeriod = currentTransaction.period || calculatePeriod(currentTransaction.date, periodStartDay)
      const newPeriod = updateData.period || oldPeriod

      // Recalculate old category/period
      await this.recalculateBudgetSpent(profileId, currentTransaction.category, oldPeriod)

      // Recalculate new category/period if changed
      if (updates.category || updates.type === 'expense') {
        const newCategory = updates.category || currentTransaction.category
        await this.recalculateBudgetSpent(profileId, newCategory, newPeriod)
      }
    }

    // Handle transfer updates
    if (currentTransaction.type === 'transfer' || updates.type === 'transfer') {
      // Delete old transfer effects
      await this.handleTransferDeletion(profileId, currentTransaction)
      // Apply new transfer effects
      if (updates.type === 'transfer' || currentTransaction.type === 'transfer') {
        await this.handleTransferToBudget(profileId, { ...currentTransaction, ...updates }, updateData.period || currentTransaction.period, updateData.amount || currentTransaction.amount)
      }
    }

    return data
  },

  // Delete transaction with side effects
  async deleteTransaction(profileId: string, transactionId: string): Promise<void> {
    // Get transaction before deletion
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('profile_id', profileId)
      .single()

    if (fetchError) throw fetchError
    if (!transaction) throw new Error('Transaction not found')

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('profile_id', profileId)

    if (error) throw error

    // Handle side effects
    if (transaction.type === 'expense') {
      await this.recalculateBudgetSpent(profileId, transaction.category, transaction.period || '')
    } else if (transaction.type === 'transfer') {
      await this.handleTransferDeletion(profileId, transaction)
    }
  },

  // Bulk operations
  async addBulkTransactions(
    profileId: string,
    transactions: TransactionInput[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const batchSize = 50
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      
      try {
        // Get settings for period calculation
        const { data: settings, error: settingsError } = await supabase
          .from('user_settings')
          .select('custom_period_start_day')
          .eq('profile_id', profileId)
          .single()

        // Handle case where settings don't exist yet (not an error)
        const periodStartDay = settings?.custom_period_start_day || 1

        const batchData = batch.map(t => ({
          profile_id: profileId,
          amount: Math.round(t.amount * 100) / 100,
          description: t.description,
          category: t.category,
          type: t.type,
          date: t.date,
          is_recurring: t.is_recurring || false,
          recurring_type: t.recurring_type,
          from_category: t.from_category,
          to_category: t.to_category,
          period: calculatePeriod(t.date, periodStartDay)
        }))

        const { error } = await supabase
          .from('transactions')
          .insert(batchData)

        if (error) {
          failed += batch.length
          errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
        } else {
          success += batch.length
          
          // Update budgets for expenses
          const expenses = batch.filter(t => t.type === 'expense')
          for (const expense of expenses) {
            const period = calculatePeriod(expense.date, periodStartDay)
            await this.updateBudgetSpent(profileId, expense.category, period, expense.amount)
          }
        }
      } catch (error: any) {
        failed += batch.length
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
      }
    }

    return { success, failed, errors }
  },

  // Helper: Update budget spent amount
  async updateBudgetSpent(
    profileId: string,
    category: string,
    period: string,
    amount: number
  ): Promise<void> {
    // Get budget (if exists)
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('profile_id', profileId)
      .eq('category', category)
      .eq('period', period)
      .single()

    // Only update if budget exists (don't auto-create budgets)
    if (budget && !budgetError) {
      const newSpent = toNumber(budget.spent) + amount
      await supabase
        .from('budgets')
        .update({ spent: newSpent.toFixed(2) })
        .eq('id', budget.id)
    }
    // If budget doesn't exist, we silently skip (budget must be created explicitly)
  },

  // Helper: Recalculate budget spent from all transactions
  async recalculateBudgetSpent(
    profileId: string,
    category: string,
    period: string
  ): Promise<void> {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('profile_id', profileId)
      .eq('category', category)
      .eq('type', 'expense')
      .eq('period', period)
      .eq('archived', false)

    const totalSpent = transactions?.reduce((sum, t) => sum + toNumber(t.amount), 0) || 0

    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('profile_id', profileId)
      .eq('category', category)
      .eq('period', period)
      .single()

    // Only update if budget exists
    if (budget && !budgetError) {
      await supabase
        .from('budgets')
        .update({ spent: totalSpent.toFixed(2) })
        .eq('id', budget.id)
    }
  },

  // Helper: Handle transfer to budget
  async handleTransferToBudget(
    profileId: string,
    transaction: TransactionInput | Transaction,
    period: string,
    amount: number
  ): Promise<void> {
    if (transaction.type !== 'transfer' || !transaction.to_category) return

    // Check if destination is a budget category
    const { data: category } = await supabase
      .from('categories')
      .select('type')
      .eq('profile_id', profileId)
      .eq('name', transaction.to_category)
      .single()

    if (category?.type === 'budget') {
      // Update budget allocation
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('profile_id', profileId)
        .eq('category', transaction.to_category)
        .eq('period', period)
        .single()

      if (budget && !budgetError) {
        const newAllocated = toNumber(budget.allocated) + amount
        await supabase
          .from('budgets')
          .update({ allocated: newAllocated.toFixed(2) })
          .eq('id', budget.id)
      }
    } else if (category?.type === 'savings') {
      // Update savings total
      const { data: savings, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('profile_id', profileId)
        .eq('category', transaction.to_category)
        .single()

      if (savings && !savingsError) {
        const newTotal = toNumber(savings.total_amount) + amount
        await supabase
          .from('savings')
          .update({ total_amount: newTotal.toFixed(2) })
          .eq('id', savings.id)
      }
    }
  },

  // Helper: Handle transfer deletion (reverse effects)
  async handleTransferDeletion(
    profileId: string,
    transaction: Transaction
  ): Promise<void> {
    if (transaction.type !== 'transfer' || !transaction.to_category) return

    const { data: category } = await supabase
      .from('categories')
      .select('type')
      .eq('profile_id', profileId)
      .eq('name', transaction.to_category)
      .single()

    if (category?.type === 'budget' && transaction.period) {
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('profile_id', profileId)
        .eq('category', transaction.to_category)
        .eq('period', transaction.period)
        .single()

      if (budget && !budgetError) {
        const newAllocated = Math.max(0, toNumber(budget.allocated) - transaction.amount)
        await supabase
          .from('budgets')
          .update({ allocated: newAllocated.toFixed(2) })
          .eq('id', budget.id)
      }
    } else if (category?.type === 'savings') {
      const { data: savings, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('profile_id', profileId)
        .eq('category', transaction.to_category)
        .single()

      if (savings && !savingsError) {
        const newTotal = Math.max(0, toNumber(savings.total_amount) - transaction.amount)
        await supabase
          .from('savings')
          .update({ total_amount: newTotal.toFixed(2) })
          .eq('id', savings.id)
      }
    }
  },

  // Maintenance operations
  async archiveOldTransactions(profileId: string): Promise<number> {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const { data, error } = await supabase
      .from('transactions')
      .update({ archived: true })
      .eq('profile_id', profileId)
      .eq('archived', false)
      .lt('date', oneYearAgo.toISOString().split('T')[0])
      .select()

    if (error) throw error
    return data?.length || 0
  },

  async getArchivedTransactions(profileId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('archived', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}