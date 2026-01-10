export interface Transaction {
    id: string
    profile_id: string
    amount: number
    description: string
    category: string
    type: 'income' | 'expense' | 'transfer'
    date: string
    created_at?: string
    is_recurring?: boolean
    recurring_type?: 'monthly' | 'weekly' | 'yearly'
    archived?: boolean
    from_category?: string
    to_category?: string
    period?: string
    parent_transaction_id?: string
  }
  
  export interface TransactionInput {
    amount: number
    description: string
    category: string
    type: 'income' | 'expense' | 'transfer'
    date: string
    is_recurring?: boolean
    recurring_type?: 'monthly' | 'weekly' | 'yearly'
    from_category?: string
    to_category?: string
  }