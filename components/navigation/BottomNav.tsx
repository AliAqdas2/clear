'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useMemo, memo } from 'react'
import AddModal from '@/components/forms/AddModal'
import { LayoutDashboard, Calendar, Handshake, Plus, RefreshCw, Home } from 'lucide-react'

// Memoize nav items to prevent recreation on every render
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Summary' },
  { href: '/dashboard/this-month', icon: LayoutDashboard, label: 'This Month' },
  { href: '#add', icon: Plus, label: 'Add', isSpecial: true },
  { href: '/dashboard/future', icon: Calendar, label: 'Future' },
  { href: '/dashboard/friends', icon: Handshake, label: 'Loans' },
]

function BottomNav() {
  const pathname = usePathname()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Memoize active state calculation
  const activeStates = useMemo(() => {
    return navItems.reduce((acc, item) => {
      if (!item.isSpecial) {
        acc[item.href] = item.href === '/dashboard'
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')
      }
      return acc
    }, {} as Record<string, boolean>)
  }, [pathname])

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-light border-t border-border-light flex items-center h-16 md:hidden z-50">
        <div className="flex w-full justify-around items-center relative">
          {navItems.map((item) => {
            const isActive = !item.isSpecial ? activeStates[item.href] : false
            const Icon = item.icon

            if (item.isSpecial) {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsAddModalOpen(true)}
                  className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center"
                >
                  <div className="size-14 bg-primary rounded-full flex items-center justify-center text-text-main shadow-lg hover:brightness-105 transition-all">
                    <Plus className="w-7 h-7" />
                  </div>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center p-2 min-w-[64px] flex-1 ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-0.5 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  )
}

// Memoize the component - it has no props, so it should only re-render when pathname changes
export default memo(BottomNav)
