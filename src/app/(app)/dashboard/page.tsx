import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getDict } from '@/i18n/server'
import { formatCurrency } from '@/lib/utils/format'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const t = await getDict()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [quotesRes, jobsRes, customersCountRes, newCustomersRes] = await Promise.all([
    supabase.from('quotes').select('status, total'),
    supabase.from('jobs').select('status'),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  const hasError = !!(quotesRes.error || jobsRes.error || customersCountRes.error || newCustomersRes.error)

  const quotes = quotesRes.data ?? []
  const jobs = jobsRes.data ?? []
  const totalCustomers = customersCountRes.count ?? 0
  const newCustomers30d = newCustomersRes.count ?? 0

  const acceptedRevenue = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + (q.total ?? 0), 0)

  const pipelineRevenue = quotes
    .filter((q) => q.status === 'sent')
    .reduce((sum, q) => sum + (q.total ?? 0), 0)

  const openJobsCount = jobs.filter((j) => j.status === 'open').length

  // Show all status rows (including zeros) so users can see the full picture
  const quoteBreakdown = quotes.length > 0 ? [
    { key: 'draft',    label: t.quotes.status.draft,    count: quotes.filter((q) => q.status === 'draft').length },
    { key: 'sent',     label: t.quotes.status.sent,     count: quotes.filter((q) => q.status === 'sent').length },
    { key: 'accepted', label: t.quotes.status.accepted, count: quotes.filter((q) => q.status === 'accepted').length },
    { key: 'rejected', label: t.quotes.status.rejected, count: quotes.filter((q) => q.status === 'rejected').length },
  ] : []

  const jobBreakdown = jobs.length > 0 ? [
    { key: 'open', label: t.jobs.statusValues.open, count: jobs.filter((j) => j.status === 'open').length },
    { key: 'won',  label: t.jobs.statusValues.won,  count: jobs.filter((j) => j.status === 'won').length },
    { key: 'lost', label: t.jobs.statusValues.lost, count: jobs.filter((j) => j.status === 'lost').length },
  ] : []

  const stats = [
    {
      label: t.dashboard.totalQuotes,
      count: quotes.length,
      href: '/quotes',
      ariaLabel: t.dashboard.viewAllQuotes,
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
      detail: quotes.length > 0 ? (
        <div className={styles.statDetail}>
          {(acceptedRevenue > 0 || pipelineRevenue > 0) && (
            <div className={styles.revenueStrip}>
              {acceptedRevenue > 0 && (
                <span className={styles.revenueItem}>
                  <span className={styles.revenueLabel}>{t.dashboard.wonRevenue}</span>
                  <span className={styles.revenueValue}>{formatCurrency(acceptedRevenue)}</span>
                </span>
              )}
              {pipelineRevenue > 0 && (
                <span className={styles.revenueItem}>
                  <span className={styles.revenueLabel}>{t.dashboard.pipeline}</span>
                  <span className={styles.revenueValue}>{formatCurrency(pipelineRevenue)}</span>
                </span>
              )}
            </div>
          )}
          <div className={styles.statBreakdown}>
            {quoteBreakdown.map((item) => (
              <span key={item.key} className={styles.statBreakdownItem}>
                <span className={styles.statBreakdownDot} aria-hidden />
                <span className={styles.statBreakdownValue}>{item.count}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null,
    },
    {
      label: t.dashboard.openJobs,
      count: openJobsCount,
      href: '/jobs?jobStatus=open',
      ariaLabel: t.dashboard.viewAllJobs,
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
      detail: jobBreakdown.length > 0 ? (
        <div className={styles.statBreakdown}>
          {jobBreakdown.map((item) => (
            <span key={item.key} className={styles.statBreakdownItem}>
              <span className={styles.statBreakdownDot} aria-hidden />
              <span className={styles.statBreakdownValue}>{item.count}</span>
              {item.label}
            </span>
          ))}
        </div>
      ) : null,
    },
    {
      label: t.dashboard.customers,
      count: totalCustomers,
      href: '/customers',
      ariaLabel: t.dashboard.viewAllCustomers,
      cardClass: styles.statCustomers,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      detail: totalCustomers > 0 ? (
        <div className={styles.statBreakdown}>
          <span className={styles.statBreakdownItem}>
            <span className={styles.statBreakdownDot} aria-hidden />
            <span className={styles.statBreakdownValue}>{newCustomers30d}</span>
            {t.dashboard.newThisMonth}
          </span>
        </div>
      ) : null,
    },
  ]

  return (
    <div>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t.dashboard.title}
        </h1>
        <p className={styles.pageSubtitle}>
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* Stat cards */}
      {hasError && (
        <div className={styles.errorBanner} role="alert">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{t.dashboard.dataError}</span>
          <span className={styles.errorHint}>{t.dashboard.dataErrorRetry}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            aria-label={s.ariaLabel}
            className={`card-interactive group relative ${styles.statCard} ${s.cardClass}`}
          >
            {/* Subtle ambient blob */}
            <div
              aria-hidden
              className={styles.statBlob}
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
              {'detail' in s && s.detail}
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
          {t.dashboard.quickActions}
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
            {t.dashboard.newQuote}
          </Link>
          <Link
            href="/customers"
            className="btn-ghost flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            {t.dashboard.newCustomer}
          </Link>
        </div>
      </div>
    </div>
  )
}
