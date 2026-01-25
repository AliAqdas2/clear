'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, X } from 'lucide-react'

export default function AddFriendButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Find user by username (case-insensitive)
    const { data: foundUser, error: findError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', username.trim())
      .single()

    if (findError) {
      console.error('Find user error:', findError)
      // RLS policy might be blocking - show helpful message
      if (findError.code === 'PGRST116') {
        setError('User not found. Check the username and try again.')
      } else {
        setError(`Could not find user: ${findError.message}`)
      }
      setLoading(false)
      return
    }

    if (!foundUser) {
      setError('User not found')
      setLoading(false)
      return
    }

    if (foundUser.id === user.id) {
      setError("You can't add yourself as a friend")
      setLoading(false)
      return
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${foundUser.id}),and(requester_id.eq.${foundUser.id},addressee_id.eq.${user.id})`)
      .single()

    if (existing) {
      setError('Friend request already exists')
      setLoading(false)
      return
    }

    // Create friendship request
    const { error: insertError } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: foundUser.id,
      status: 'pending',
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      setUsername('')
      // Trigger refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('data-refresh'))
      }
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 1500)
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-primary hover:brightness-95 text-text-main font-bold py-2.5 px-5 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-95"
      >
        <UserPlus className="w-5 h-5" />
        <span>Add Friend</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-text-main mb-2">Add Friend</h2>
            <p className="text-text-secondary text-sm mb-6">
              Enter their username to send a friend request.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  Friend request sent successfully!
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input-border focus:border-primary focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-text-main font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-text-main font-bold hover:brightness-95 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
