import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tableData = [
  {
    id: '1',
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    amount: '$245.50',
    date: '2024-06-28',
    type: 'Expense'
  },
  {
    id: '2',
    description: 'Salary Deposit',
    category: 'Income',
    amount: '$3,500.00',
    date: '2024-06-27',
    type: 'Income'
  },
  {
    id: '3',
    description: 'Electricity Bill',
    category: 'Bills & Utilities',
    amount: '$120.00',
    date: '2024-06-26',
    type: 'Expense'
  },
  {
    id: '4',
    description: 'Freelance Project',
    category: 'Income',
    amount: '$850.00',
    date: '2024-06-25',
    type: 'Income'
  },
  {
    id: '5',
    description: 'Gas Station',
    category: 'Transportation',
    amount: '$45.20',
    date: '2024-06-24',
    type: 'Expense'
  }
]

export function TableBasic() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className='font-medium'>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      row.type === 'Income'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {row.type}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

