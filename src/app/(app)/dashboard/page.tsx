import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [quotesRes, jobsRes, customersRes] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: 'Total Quotes',
      count: quotesRes.count ?? 0,
      href: '/quotes',
      cardClass: styles.statQuotes,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: 'Open Jobs',
      count: jobsRes.count ?? 0,
      href: '/jobs',
      cardClass: styles.statJobs,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
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
      label: 'Customers',
      count: customersRes.count ?? 0,
      href: '/customers',
      cardClass: styles.statCustomers,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          Dashboard
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          Overview of your quoting activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card-interactive group relative overflow-hidden rounded-2xl p-5 ${styles.statCard} ${s.cardClass}`}
          >
            {/* Subtle ambient blob */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-40 ${styles.statBlob}`}
            />

            <div className="relative">
              <div className={`mb-3 ${styles.statIcon}`}>
                {s.icon}
              </div>
              <p className={`text-sm font-medium ${styles.statLabel}`}>
                {s.label}
              </p>
              <p
                className={`mt-1 text-3xl font-bold tabular-nums ${styles.statCount}`}
              >
                {s.count}
              </p>
            </div>

            {/* Chevron */}
            <svg
              className={`absolute bottom-4 right-4 w-4 h-4 opacity-30 group-hover:opacity-60 ${styles.chevron}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className={`mb-3 text-xs font-semibold uppercase tracking-widest ${styles.quickActionsHeader}`}>
          Quick actions
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/quotes/new"
            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Quote
          </Link>
          <Link
            href="/jobs"
            className="btn-ghost flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            View Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
