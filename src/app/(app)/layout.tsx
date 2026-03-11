import { Sidebar } from '@/components/nav/Sidebar'
import { BottomNav } from '@/components/nav/BottomNav'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen h-dvh overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — scrollable */}
      <main className="grid-bg flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl p-4 pt-14 md:p-8 md:pt-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
