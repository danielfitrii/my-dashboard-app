'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { transactionService } from '@/lib/services/transactionService'
import type { Transaction, TransactionInput } from '@/types/transaction'

interface FinanceContextType {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  addTransaction: (transaction: TransactionInput) => Promise<void>
  updateTransaction: (id: string, updates: Partial<TransactionInput>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  deleteTransactions: (ids: string[]) => Promise<void>
  refreshTransactions: () => Promise<void>
  getTransactions: (options?: any) => Promise<Transaction[]>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({
  children,
  profileId
}: {
  children: React.ReactNode
  profileId: string
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validate profileId before making request
      if (!profileId || profileId === 'temp-profile-id') {
        console.warn('Invalid profileId, skipping transaction fetch. ProfileId:', profileId)
        setTransactions([])
        setLoading(false)
        return
      }
      
      const data = await transactionService.getTransactions(profileId)
      setTransactions(data)
    } catch (err: any) {
      // Better error handling for Supabase errors
      let errorMessage = 'Failed to fetch transactions'
      
      if (err) {
        // Supabase errors have specific structure
        if (err.message) {
          errorMessage = err.message
        } else if (err.code) {
          errorMessage = `Error ${err.code}: ${err.message || 'Unknown error'}`
        } else if (typeof err === 'string') {
          errorMessage = err
        } else {
          // Try to extract meaningful info from error object
          errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err))
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching transactions:', {
        error: err,
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        profileId,
        fullError: err
      })
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  const addTransaction = useCallback(async (transaction: TransactionInput) => {
    try {
      setError(null)
      await transactionService.addTransaction(profileId, transaction)
      await refreshTransactions()
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction')
      throw err
    }
  }, [profileId, refreshTransactions])

  const updateTransaction = useCallback(async (id: string, updates: Partial<TransactionInput>) => {
    try {
      setError(null)
      await transactionService.updateTransaction(profileId, id, updates)
      await refreshTransactions()
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction')
      throw err
    }
  }, [profileId, refreshTransactions])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null)
      await transactionService.deleteTransaction(profileId, id)
      await refreshTransactions()
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction')
      throw err
    }
  }, [profileId, refreshTransactions])

  const deleteTransactions = useCallback(async (ids: string[]) => {
    try {
      setError(null)
      await Promise.all(ids.map(id => transactionService.deleteTransaction(profileId, id)))
      await refreshTransactions()
    } catch (err: any) {
      setError(err.message || 'Failed to delete transactions')
      throw err
    }
  }, [profileId, refreshTransactions])

  const getTransactions = useCallback(async (options?: any) => {
    try {
      setError(null)
      return await transactionService.getTransactions(profileId, options)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions')
      throw err
    }
  }, [profileId])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        deleteTransactions,
        refreshTransactions,
        getTransactions
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}