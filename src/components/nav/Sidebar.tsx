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
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5">
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
      </div>

      {/* Divider */}
      <div className={`${styles.divider} ${styles.dividerInset}`} />

      {/* Nav links */}
      <nav className={styles.navSection}>
        <span className={styles.navSectionLabel} aria-hidden="true">Menu</span>
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              onClick={() => setMobileOpen(false)}
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
      <aside className={`hidden w-56 shrink-0 flex-col md:flex ${styles.sidebar}`}>
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className={`fixed left-3 top-3 z-50 md:hidden ${styles.hamburger}`}
        onClick={() => setMobileOpen(true)}
        aria-label={t.nav.openMenu}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Mobile: backdrop overlay */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${styles.overlay}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile: slide-in drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col md:hidden ${styles.sidebar} ${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}
      >
        {/* Close button row */}
        <div className="flex justify-end px-3 pt-3">
          <button
            onClick={() => setMobileOpen(false)}
            className={styles.closeButton}
            aria-label={t.nav.closeMenu}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
