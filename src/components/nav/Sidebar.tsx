'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { navLinks } from './navLinks'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={`hidden w-56 shrink-0 flex-col md:flex ${styles.sidebar}`}
    >
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold ${styles.brandIcon}`}
          >
            Q
          </div>
          <span
            className={`text-[15px] font-bold tracking-tight ${styles.brandText}`}
          >
            QuoteCalc
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} style={{ margin: '0 16px 8px' }} />

      {/* Nav links */}
      <nav className="flex-1 px-3 pt-1 space-y-0.5">
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-item flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'active' : ''}`}
            >
              {l.icon}
              {l.label}
              {active && (
                <span
                  className={`ml-auto h-1.5 w-1.5 rounded-full ${styles.activeIndicator}`}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 pt-3">
        <div className={styles.dividerSpaced} />
        <button
          onClick={handleSignOut}
          className="nav-item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
