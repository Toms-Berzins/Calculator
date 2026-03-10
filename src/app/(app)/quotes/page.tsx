import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/format'
import styles from './quotes.module.css'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft:    { bg: 'var(--status-draft-bg)',    text: 'var(--status-draft-text)',    label: 'Draft' },
  sent:     { bg: 'var(--status-sent-bg)',     text: 'var(--status-sent-text)',     label: 'Sent' },
  accepted: { bg: 'var(--status-accepted-bg)', text: 'var(--status-accepted-text)', label: 'Accepted' },
  rejected: { bg: 'var(--status-rejected-bg)', text: 'var(--status-rejected-text)', label: 'Rejected' },
}

export default async function QuotesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      id, status, total, created_at,
      jobs ( title, customers ( name, company ) )
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}
          >
            Quotes
          </h1>
          <p className={`mt-1 text-sm ${styles.quoteCount}`}>
            {quotes?.length ?? 0} total
          </p>
        </div>
        <Link
          href="/quotes/new"
          className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New
        </Link>
      </div>

      {!quotes?.length && (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyState}`}
        >
          <svg
            className={`mb-3 w-10 h-10 ${styles.emptyIcon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyIconLabel}`}>
            No quotes yet
          </p>
          <p className={`mt-1 text-sm ${styles.emptyStateHint}`}>
            Create your first quote to get started
          </p>
        </div>
      )}

      <ul className="space-y-2.5">
        {quotes?.map((q) => {
          const st = STATUS_STYLES[q.status ?? 'draft'] ?? STATUS_STYLES.draft
          const jobTitle =
            (q.jobs as { title: string } | null)?.title ?? 'Untitled job'
          const customer =
            (q.jobs as { customers: { name: string; company: string } | null } | null)
              ?.customers?.company ??
            (q.jobs as { customers: { name: string } | null } | null)?.customers?.name ??
            '—'

          return (
            <li key={q.id}>
              <Link
                href={`/quotes/${q.id}`}
                className="card-interactive group flex items-center justify-between rounded-2xl px-5 py-4"
              >
                <div className="min-w-0">
                  <p
                    className={`truncate font-semibold text-sm ${styles.jobTitle}`}
                  >
                    {jobTitle}
                  </p>
                  <p
                    className={`mt-0.5 truncate text-sm ${styles.customerName}`}
                  >
                    {customer}
                  </p>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span
                    className={styles.statusBadge}
                    style={{ background: st.bg, color: st.text }}
                  >
                    {st.label}
                  </span>
                  <p
                    className={styles.quoteAmount}
                  >
                    {formatCurrency(q.total ?? 0)}
                  </p>
                  <svg
                    className={`w-4 h-4 opacity-30 group-hover:opacity-60 ${styles.chevron}`}
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
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
