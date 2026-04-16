import type { ReactNode } from 'react'
import type { Translations } from '@/i18n/en'

export type NavLabelKey = keyof Pick<
  Translations['nav'],
  'dashboard' | 'quotes' | 'jobs' | 'customers' | 'settings' | 'materials'
>

export interface NavLink {
  href: string
  labelKey: NavLabelKey
  icon: ReactNode
}

const iconCls = 'w-5 h-5 shrink-0'

export const navLinks: NavLink[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: '/quotes',
    labelKey: 'quotes',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: '/jobs',
    labelKey: 'jobs',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
      </svg>
    ),
  },
  {
    href: '/customers',
    labelKey: 'customers',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: '/materials',
    labelKey: 'materials',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a2 2 0 114 0 2 2 0 01-4 0z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    labelKey: 'settings',
    icon: (
      <svg className={iconCls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M11.49 3.17a1 1 0 00-1.98 0l-.144.94a1 1 0 01-.746.808l-.92.24a1 1 0 01-.999-.31l-.657-.7a1 1 0 00-1.4 1.418l.66.68a1 1 0 01.217 1.01l-.3.92a1 1 0 01-.79.677l-.96.14a1 1 0 000 1.98l.94.143a1 1 0 01.807.747l.24.92a1 1 0 01-.31.998l-.7.658a1 1 0 101.418 1.4l.68-.66a1 1 0 011.01-.217l.92.3a1 1 0 01.677.79l.14.96a1 1 0 001.98 0l.143-.94a1 1 0 01.747-.807l.92-.24a1 1 0 01.998.31l.658.7a1 1 0 101.4-1.418l-.66-.68a1 1 0 01-.217-1.01l.3-.92a1 1 0 01.79-.677l.96-.14a1 1 0 000-1.98l-.94-.143a1 1 0 01-.807-.747l-.24-.92a1 1 0 01.31-.998l.7-.658a1 1 0 10-1.418-1.4l-.68.66a1 1 0 01-1.01.217l-.92-.3a1 1 0 01-.677-.79l-.14-.96zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]
