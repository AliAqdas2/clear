import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/navigation/Sidebar'
import BottomNav from '@/components/navigation/BottomNav'
import { Suspense } from 'react'

// Loading component for layout
function LayoutSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
    <div className="bg-background-light text-text-main font-display min-h-screen flex">
      {/* Sidebar - Desktop */}
      <Sidebar profile={profile} />

      {/* Main Content with Suspense for instant loading */}
      <Suspense fallback={<LayoutSkeleton />}>
        <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </Suspense>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  )
}
