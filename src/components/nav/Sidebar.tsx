'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { navLinks } from './navLinks'
import { useT } from '@/i18n/context'
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const t = useT()
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  async function handleSignOut() {
    if (!window.confirm(t.nav.signOutConfirm ?? 'Sign out of QuoteCalc?')) return
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-7 w-7 items-center justify-center text-white text-xs font-bold ${styles.brandIcon}`}
            >
              Q
            </div>
            <span
              className={`text-[15px] font-bold tracking-tight ${styles.brandText}`}
            >
              QuoteCalc
            </span>
          </div>
          {/* Desktop-only collapse button */}
          <button
            className={`hidden md:flex ${styles.closeButton}`}
            onClick={() => setDesktopCollapsed(true)}
            aria-label={t.nav.closeMenu}
          >
            {/* sidebar-collapse: vertical bar + left arrow */}
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <rect x="3" y="4" width="1.5" height="12" rx="0.75" />
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 010 1.06L8.56 9.5h7.19a.75.75 0 010 1.5H8.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className={`${styles.divider} ${styles.dividerInset}`} />

      {/* Nav links */}
      <nav className={styles.navSection} aria-label={t.nav.menu ?? 'Main navigation'}>
        <span className={styles.navSectionLabel}>{t.nav.menu ?? 'Menu'}</span>
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
            >
              {l.icon}
              {t.nav[l.labelKey]}
            </Link>
          )
        })}
      </nav>

      {/* Sign out + language switcher */}
      <div className="px-3 pb-5 pt-3">
        <div className={styles.dividerSpaced} />
        <LanguageSwitcher />
        <button
          onClick={handleSignOut}
          className={styles.navLink}
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
          {t.nav.signOut}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 flex-col md:flex ${styles.sidebar} ${desktopCollapsed ? styles.sidebarCollapsed : ''}`}>
        {sidebarContent}
      </aside>

      {/* Desktop: reopen button when collapsed */}
      {desktopCollapsed && (
        <button
          className={`hidden md:flex fixed left-3 top-3 z-50 ${styles.hamburger}`}
          onClick={() => setDesktopCollapsed(false)}
          aria-label={t.nav.openMenu}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </>
  )
}
