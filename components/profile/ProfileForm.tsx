'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  username: string
  real_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface ProfileFormProps {
  profile: Profile | null
  userEmail: string
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    real_name: profile?.real_name || '',
    phone: profile?.phone || '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        real_name: formData.real_name,
        phone: formData.phone,
      })
      .eq('id', profile?.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Profile updated successfully!
        </div>
      )}

      {/* Email (Read-only) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main" htmlFor="email">
          Email
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-input-border bg-gray-50 text-text-secondary cursor-not-allowed"
          id="email"
          type="email"
          value={userEmail}
          disabled
        />
        <p className="text-xs text-text-secondary">Email cannot be changed.</p>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main" htmlFor="username">
          Username
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50"
          id="username"
          name="username"
          type="text"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      {/* Real Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main" htmlFor="real_name">
          Real Name
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50"
          id="real_name"
          name="real_name"
          type="text"
          placeholder="Your real name"
          value={formData.real_name}
          onChange={handleChange}
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main" htmlFor="phone">
          Phone Number
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50"
          id="phone"
          name="phone"
          type="tel"
          placeholder="+92 300 1234567"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-primary text-text-main font-bold hover:brightness-95 disabled:opacity-50 transition-all"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

