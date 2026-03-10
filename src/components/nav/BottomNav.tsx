'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navLinks } from './navLinks'
import styles from './BottomNav.module.css'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={`glass fixed bottom-0 left-0 right-0 z-50 flex md:hidden ${styles.nav}`}
    >
      {navLinks.map((l) => {
        const active = pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 pb-safe py-3 ${active ? styles.navItemActive : styles.navItemInactive}`}
          >
            <span
              className={`flex items-center justify-center rounded-lg p-1 ${active ? styles.navIconActive : styles.navIconInactive}`}
            >
              {l.icon}
            </span>
            <span
              className={`text-[10px] font-medium leading-none ${active ? styles.navLabelActive : styles.navLabelInactive}`}
            >
              {l.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
