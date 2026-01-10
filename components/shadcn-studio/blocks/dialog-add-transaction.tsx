'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type AddTransactionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (transaction: {
    description: string
    category: string
    amount: number
    date: string
    type: 'Income' | 'Expense'
    runningBalance: number
  }) => void
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAdd
}: AddTransactionDialogProps) {
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [type, setType] = React.useState<'Income' | 'Expense'>('Expense')
  const [runningBalance, setRunningBalance] = React.useState('')

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Income',
    'Other'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !category || !amount) return

    onAdd({
      description,
      category,
      amount: parseFloat(amount),
      date,
      type,
      runningBalance: parseFloat(runningBalance) || 0
    })

    // Reset form
    setDescription('')
    setCategory('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setType('Expense')
    setRunningBalance('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new transaction to your records
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                placeholder='Enter transaction description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='category'>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id='category'>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='amount'>Amount (RM)</Label>
                <Input
                  id='amount'
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='date'>Date</Label>
                <Input
                  id='date'
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='type'>Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as 'Income' | 'Expense')}>
                  <SelectTrigger id='type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Income'>Income</SelectItem>
                    <SelectItem value='Expense'>Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='runningBalance'>Running Balance (RM)</Label>
                <Input
                  id='runningBalance'
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={runningBalance}
                  onChange={(e) => setRunningBalance(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit'>Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

