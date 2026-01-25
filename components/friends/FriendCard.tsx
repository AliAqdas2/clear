'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Check, ArrowRight } from 'lucide-react'

interface Profile {
  id: string
  username: string
  real_name: string | null
  avatar_url: string | null
}

interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: string
  requester: Profile
  addressee: Profile
}

interface FriendCardProps {
  friendship: Friendship
  currentUserId: string
  balance: number
  isPending: boolean
}

export default function FriendCard({ friendship, currentUserId, balance, isPending }: FriendCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const friend = friendship.requester_id === currentUserId 
    ? friendship.addressee 
    : friendship.requester

  const handleAccept = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendship.id)
    if (!error) {
      // Trigger refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
    }
    setLoading(false)
  }

  const handleDecline = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendship.id)
    if (!error) {
      // Trigger refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
    }
    setLoading(false)
  }

  const initials = (friend.username || 'U').substring(0, 2).toUpperCase()

  if (isPending) {
    return (
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-yellow-50/50 border-l-4 border-yellow-400">
        <div className="col-span-5 flex items-center gap-4">
          <div className="relative">
            <div className="size-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-sm">
              {initials}
            </div>
            <div className="absolute -top-1 -right-1 size-4 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-2.5 h-2.5 text-yellow-900" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main truncate">
              {friend.real_name || friend.username}
            </p>
            <p className="text-xs text-gray-500 truncate">Friend Request</p>
          </div>
        </div>
        <div className="col-span-5 flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-text-main text-white hover:bg-opacity-90 transition-colors text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-bold disabled:opacity-50"
          >
            Ignore
          </button>
        </div>
        <div className="col-span-2"></div>
      </div>
    )
  }

  const balanceText = balance === 0 
    ? 'Settled up' 
    : balance > 0 
      ? `Owes you PKR ${Math.abs(balance).toLocaleString()}`
      : `You owe PKR ${Math.abs(balance).toLocaleString()}`

  const balanceClass = balance === 0
    ? 'bg-gray-100 text-gray-600'
    : balance > 0
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors group cursor-pointer">
      <div className="col-span-5 flex items-center gap-4">
        <div className="relative">
          <div 
            className="size-10 rounded-full bg-cover bg-center bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm"
            style={{
              backgroundImage: friend.avatar_url ? `url(${friend.avatar_url})` : undefined
            }}
          >
            {!friend.avatar_url && initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main truncate">
            {friend.real_name || friend.username}
          </p>
          <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
        </div>
      </div>

      <div className="col-span-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${balanceClass}`}>
          {balanceText}
        </span>
      </div>

      <div className="col-span-2 text-sm text-gray-500">
        Active
      </div>

      <div className="col-span-2 flex justify-end gap-2">
        {balance < 0 && (
          <button className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-text-main text-primary-dark font-bold text-xs transition-colors">
            Settle Up
          </button>
        )}
        <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
