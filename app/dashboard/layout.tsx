import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/navigation/Sidebar'
import BottomNav from '@/components/navigation/BottomNav'
import ChatBot from '@/components/ai/ChatBot'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="bg-background-light text-text-main font-display min-h-screen flex overflow-x-hidden">
      {/* Sidebar - Desktop - Stable, doesn't re-render */}
      <Sidebar profile={profile} />

      {/* Main Content - Only this area updates on navigation */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 md:ml-64 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation - Mobile - Stable, doesn't re-render */}
      <BottomNav />

      {/* AI Chat Assistant - Floating button */}
      <ChatBot />
    </div>
  )
}
