// Utility to help diagnose Supabase connection issues
import { supabase } from '@/lib/supabase/client'

export async function checkSupabaseConnection() {
  const diagnostics = {
    envVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    tables: {
      transactions: false,
      profiles: false,
      categories: false,
      budgets: false,
      savings: false,
      user_settings: false,
    },
    errors: [] as string[],
  }

  // Check if we can connect to Supabase
  try {
    // Try to query a simple table to test connection
    const { error: transactionsError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)

    if (!transactionsError) {
      diagnostics.tables.transactions = true
    } else {
      diagnostics.errors.push(`transactions table: ${transactionsError.message || transactionsError.code || 'Unknown error'}`)
    }
  } catch (err: any) {
    diagnostics.errors.push(`Failed to check transactions table: ${err.message || 'Unknown error'}`)
  }

  // Check other tables
  const tablesToCheck = ['profiles', 'categories', 'budgets', 'savings', 'user_settings']
  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (!error) {
        diagnostics.tables[table as keyof typeof diagnostics.tables] = true
      }
    } catch (err: any) {
      // Table might not exist or RLS is blocking - that's okay for now
    }
  }

  return diagnostics
}
