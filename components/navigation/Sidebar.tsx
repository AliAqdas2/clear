'use client'

import { useState, useMemo, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Calendar, Handshake, User, Settings, Plus, RefreshCw, Home } from 'lucide-react'
import AddModal from '@/components/forms/AddModal'

interface Profile {
  id: string
  username: string
  real_name: string | null
  avatar_url: string | null
}

interface SidebarProps {
  profile: Profile | null
}

// Memoize nav items to prevent recreation on every render
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Summary' },
  { href: '/dashboard/this-month', icon: LayoutDashboard, label: 'This Month' },
  { href: '/dashboard/future', icon: Calendar, label: 'Future' },
  { href: '/dashboard/recurring', icon: RefreshCw, label: 'Recurring' },
  { href: '/dashboard/friends', icon: Handshake, label: 'Loans' },
]

function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Memoize active state calculation
  const activeStates = useMemo(() => {
    return navItems.reduce((acc, item) => {
      acc[item.href] = item.href === '/dashboard'
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(item.href + '/')
      return acc
    }, {} as Record<string, boolean>)
  }, [pathname])

  const isProfileActive = useMemo(() => {
    return pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/profile')
  }, [pathname])

  return (
    <>
      <aside className="w-64 flex-shrink-0 bg-surface-light border-r border-border-light hidden md:flex flex-col h-screen sticky top-0 transition-colors duration-200">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border-light">
          <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
            <Image src="/logo.png" alt="Clear" width={24} height={24} className="rounded" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-main">Clear</h1>
        </div>

        {/* Add Button */}
        <div className="px-3 pt-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:brightness-95 text-text-main font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeStates[item.href]
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-green-700'
                    : 'text-text-secondary hover:bg-background-light hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-border-light">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Account
            </p>
            <Link
              href="/dashboard/profile"
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isProfileActive
                  ? 'bg-primary/10 text-green-700'
                  : 'text-text-secondary hover:bg-background-light hover:text-primary'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="/dashboard/settings"
              prefetch={true}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-background-light hover:text-primary transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border-light">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm bg-gray-100"
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url(${profile.avatar_url})`
                  : `url(https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || 'U'})`,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-text-main">
                {profile?.real_name || profile?.username || 'User'}
              </p>
              <p className="text-xs text-text-secondary truncate">
                @{profile?.username || 'user'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  )
}

// Memoize the component to prevent re-renders when props haven't changed
export default memo(Sidebar, (prevProps, nextProps) => {
  // Only re-render if profile actually changed
  return (
    prevProps.profile?.id === nextProps.profile?.id &&
    prevProps.profile?.username === nextProps.profile?.username &&
    prevProps.profile?.real_name === nextProps.profile?.real_name &&
    prevProps.profile?.avatar_url === nextProps.profile?.avatar_url
  )
})
