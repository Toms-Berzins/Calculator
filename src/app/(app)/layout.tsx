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
      {/* Skip to main content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-sm focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-bold focus-visible:text-black focus-visible:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — scrollable */}
      <main id="main-content" className="grid-bg flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div className="mx-auto max-w-4xl p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
