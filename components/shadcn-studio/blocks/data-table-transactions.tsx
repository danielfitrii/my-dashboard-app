'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { DataTableColumnHeader } from './data-table-column-header'
import { DataTablePagination } from './data-table-pagination'
import { DataTableViewOptions } from './data-table-view-options'

export type Transaction = {
  id: string
  description: string
  category: string
  amount: number
  date: string
  type: 'Income' | 'Expense'
  status: 'completed' | 'pending' | 'failed'
}

const data: Transaction[] = [
  {
    id: '1',
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    amount: 245.5,
    date: '2024-06-28',
    type: 'Expense',
    status: 'completed'
  },
  {
    id: '2',
    description: 'Salary Deposit',
    category: 'Income',
    amount: 3500.0,
    date: '2024-06-27',
    type: 'Income',
    status: 'completed'
  },
  {
    id: '3',
    description: 'Electricity Bill',
    category: 'Bills & Utilities',
    amount: 120.0,
    date: '2024-06-26',
    type: 'Expense',
    status: 'pending'
  },
  {
    id: '4',
    description: 'Freelance Project',
    category: 'Income',
    amount: 850.0,
    date: '2024-06-25',
    type: 'Income',
    status: 'completed'
  },
  {
    id: '5',
    description: 'Gas Station',
    category: 'Transportation',
    amount: 45.2,
    date: '2024-06-24',
    type: 'Expense',
    status: 'completed'
  },
  {
    id: '6',
    description: 'Restaurant Dinner',
    category: 'Food & Dining',
    amount: 89.5,
    date: '2024-06-23',
    type: 'Expense',
    status: 'completed'
  },
  {
    id: '7',
    description: 'Investment Return',
    category: 'Income',
    amount: 250.0,
    date: '2024-06-22',
    type: 'Income',
    status: 'completed'
  },
  {
    id: '8',
    description: 'Internet Bill',
    category: 'Bills & Utilities',
    amount: 65.0,
    date: '2024-06-21',
    type: 'Expense',
    status: 'failed'
  },
  {
    id: '9',
    description: 'Uber Ride',
    category: 'Transportation',
    amount: 32.5,
    date: '2024-06-20',
    type: 'Expense',
    status: 'completed'
  },
  {
    id: '10',
    description: 'Consulting Fee',
    category: 'Income',
    amount: 1200.0,
    date: '2024-06-19',
    type: 'Income',
    status: 'completed'
  },
  {
    id: '11',
    description: 'Coffee Shop',
    category: 'Food & Dining',
    amount: 12.5,
    date: '2024-06-18',
    type: 'Expense',
    status: 'completed'
  },
  {
    id: '12',
    description: 'Gym Membership',
    category: 'Bills & Utilities',
    amount: 49.99,
    date: '2024-06-17',
    type: 'Expense',
    status: 'completed'
  }
]

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('description')}</div>
    )
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => <div>{row.getValue('category')}</div>
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR'
      }).format(amount)

      return (
        <div
          className={`font-medium ${
            row.original.type === 'Income' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatted}
        </div>
      )
    }
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('date') as string
      // Format date consistently: YYYY-MM-DD to MM/DD/YYYY
      const [year, month, day] = dateString.split('-')
      return <div>{`${month}/${day}/${year}`}</div>
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <span
          className={`text-xs font-medium ${
            type === 'Income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {type}
        </span>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusColors = {
        completed: 'text-green-600 dark:text-green-400',
        pending: 'text-yellow-600 dark:text-yellow-400',
        failed: 'text-red-600 dark:text-red-400'
      }
      return (
        <span
          className={`text-xs font-medium capitalize ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit transaction</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-red-600'>
              Delete transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export function DataTableTransactions() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Manage and view your financial transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='w-full space-y-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <Input
              placeholder='Filter by description...'
              value={
                (table.getColumn('description')?.getFilterValue() as string) ??
                ''
              }
              onChange={(event) =>
                table
                  .getColumn('description')
                  ?.setFilterValue(event.target.value)
              }
              className='w-full max-w-sm'
            />
            <DataTableViewOptions table={table} />
          </div>
          <div className='overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div>
            <DataTablePagination table={table} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

