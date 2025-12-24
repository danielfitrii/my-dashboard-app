'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'

const getBreadcrumbItems = (pathname: string) => {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/budgets': 'Budgets',
    '/recurring-expenses': 'Recurring Expenses',
    '/savings': 'Savings',
    '/transactions': 'Transactions',
    '/settings/balance-management': 'Balance Management',
    '/settings/categories/budget': 'Budget',
    '/settings/categories/expenses': 'Expenses',
    '/settings/categories/income': 'Income',
    '/settings/categories/savings': 'Savings',
    '/settings/data-management': 'Data Management',
    '/settings/display-preferences': 'Display Preferences'
  }

  const items: Array<{ href: string; label: string }> = []

  // Dashboard is under "Home" group
  if (pathname === '/') {
    items.push({ href: '#', label: 'Home' })
    items.push({ href: '/', label: 'Dashboard' })
    return items
  }

  // Pages under "Pages" group
  const pagesGroupRoutes = ['/budgets', '/recurring-expenses', '/savings', '/transactions']
  if (pagesGroupRoutes.includes(pathname)) {
    items.push({ href: '#', label: 'Pages' })
    const pageTitle = routes[pathname] || 'Page'
    items.push({ href: pathname, label: pageTitle })
    return items
  }

  // Settings pages
  if (pathname.startsWith('/settings/categories/')) {
    items.push({ href: '#', label: 'Settings' })
    items.push({ href: '#', label: 'Categories' })
    const categoryPage = routes[pathname]
    if (categoryPage) {
      items.push({ href: pathname, label: categoryPage })
    }
  } else if (pathname.startsWith('/settings/')) {
    items.push({ href: '#', label: 'Settings' })
    const settingsPage = routes[pathname]
    if (settingsPage) {
      items.push({ href: pathname, label: settingsPage })
    }
  }

  return items
}

const AppHeader = () => {
  const pathname = usePathname()
  const breadcrumbItems = getBreadcrumbItems(pathname)
  return (
    <header className='bg-card sticky top-0 z-50 border-b'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='[&_svg]:!size-5' />
          <Separator orientation='vertical' className='hidden !h-4 sm:block' />
          <Breadcrumb className='hidden sm:block'>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1
                const isClickable = item.href !== '#'
                const isCurrentPage = isLast && pathname === item.href
                
                return (
                  <React.Fragment key={`${item.href}-${index}`}>
                    <BreadcrumbItem>
                      {isClickable ? (
                        <BreadcrumbLink asChild>
                          <Link 
                            href={item.href}
                            className={cn(
                              isCurrentPage && 'text-foreground font-medium bg-accent/50 px-2 py-0.5 rounded'
                            )}
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className='text-muted-foreground'>{item.label}</span>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='flex items-center gap-1.5'>
          <ProfileDropdown
            trigger={
              <Button variant='ghost' size='icon' className='size-9.5'>
                <Avatar className='size-9.5 rounded-md'>
                  <AvatarFallback>
                    <UserIcon className='size-5' />
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}

export default AppHeader

