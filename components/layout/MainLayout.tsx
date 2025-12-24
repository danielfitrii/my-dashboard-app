import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SidebarProvider } from '@/components/ui/sidebar'

import AppSidebar from '@/components/layout/Sidebar'
import AppHeader from '@/components/layout/Header'

type MainLayoutProps = {
  children?: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <AppHeader />
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            {children || (
              <Card className='h-250'>
                <CardContent className='h-full'>
                  <div className='h-full rounded-md border bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_1px,var(--card)_2px,var(--card)_15px)]' />
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

