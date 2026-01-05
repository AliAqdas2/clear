'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium">{loading ? 'Logging out...' : 'Log Out'}</span>
    </button>
  )
}
