'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboardIcon,
  WalletIcon,
  RepeatIcon,
  PiggyBankIcon,
  ReceiptIcon,
  FolderTreeIcon,
  ScaleIcon,
  PaletteIcon,
  DatabaseIcon,
  TrendingDownIcon,
  ChevronDownIcon,
  TagIcon
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

const AppSidebar = () => {
  const pathname = usePathname()
  const isCategoryPage = pathname.startsWith('/settings/categories')
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(isCategoryPage)
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link href='/'>
                    <LayoutDashboardIcon />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/budgets'}>
                  <Link href='/budgets'>
                    <WalletIcon />
                    <span>Budgets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/recurring-expenses'}>
                  <Link href='/recurring-expenses'>
                    <RepeatIcon />
                    <span>Recurring Expenses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/savings'}>
                  <Link href='/savings'>
                    <PiggyBankIcon />
                    <span>Savings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/transactions'}>
                  <Link href='/transactions'>
                    <ReceiptIcon />
                    <span>Transactions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings/balance-management'}>
                  <Link href='/settings/balance-management'>
                    <ScaleIcon />
                    <span>Balance Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FolderTreeIcon />
                      <span>Categories</span>
                      <ChevronDownIcon className={`ml-auto transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/settings/categories/budget'}>
                          <Link href='/settings/categories/budget'>
                            <TagIcon />
                            <span>Budget</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/settings/categories/expenses'}>
                          <Link href='/settings/categories/expenses'>
                            <TrendingDownIcon />
                            <span>Expenses</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/settings/categories/income'}>
                          <Link href='/settings/categories/income'>
                            <WalletIcon />
                            <span>Income</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/settings/categories/savings'}>
                          <Link href='/settings/categories/savings'>
                            <PiggyBankIcon />
                            <span>Savings</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings/data-management'}>
                  <Link href='/settings/data-management'>
                    <DatabaseIcon />
                    <span>Data Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings/display-preferences'}>
                  <Link href='/settings/display-preferences'>
                    <PaletteIcon />
                    <span>Display Preferences</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar

