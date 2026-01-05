import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/profile/ProfileForm'
import LogoutButton from '@/components/profile/LogoutButton'
import { Camera, Trash2 } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8">Please log in to view your profile.</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get some stats
  const { count: transactionCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: friendCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-text-main">Profile</h1>
        <p className="text-text-secondary">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 flex flex-col items-center">
          <div className="relative group cursor-pointer mb-4">
            <div 
              className="h-24 w-24 rounded-full bg-cover bg-center border-4 border-white shadow-md bg-gray-100 flex items-center justify-center"
              style={{
                backgroundImage: profile?.avatar_url 
                  ? `url(${profile.avatar_url})` 
                  : `url(https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || 'U'})`
              }}
            />
            <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-2 border-white text-text-main shadow-sm transition-transform group-hover:scale-110">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-main">
            {profile?.real_name || profile?.username || 'User'}
          </h2>
          <p className="text-text-secondary">@{profile?.username || 'user'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-6 text-center">
            <p className="text-3xl font-bold text-text-main">{transactionCount || 0}</p>
            <p className="text-sm text-text-secondary">Transactions</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-3xl font-bold text-text-main">{friendCount || 0}</p>
            <p className="text-sm text-text-secondary">Friends</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <ProfileForm profile={profile} userEmail={user.email || ''} />
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-text-main mb-4">Account</h3>
        <div className="flex flex-col gap-3">
          <LogoutButton />
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left">
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Delete Account</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-text-secondary">
        <p>Clear - Financial Clarity App</p>
        <p className="text-xs mt-1 opacity-60">Version 1.0.0</p>
      </div>
    </div>
  )
}
