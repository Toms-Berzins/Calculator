import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import styles from './jobs.module.css'

const JOB_STATUS: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: styles.statusOpen },
  won: { label: 'Won', className: styles.statusWon },
  lost: { label: 'Lost', className: styles.statusLost },
  archived: { label: 'Archived', className: styles.statusArchived },
}

export default async function JobsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, status, created_at, customers ( name, company )')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          Jobs
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {jobs?.length ?? 0} total
        </p>
      </div>

      {!jobs?.length && (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyCard}`}
        >
          <svg
            className={`mb-3 w-10 h-10 ${styles.emptyIcon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>
            No jobs yet
          </p>
        </div>
      )}

      <ul className="space-y-2.5">
        {jobs?.map((j) => {
          const st = JOB_STATUS[j.status ?? 'open'] ?? JOB_STATUS.open
          const customer =
            (j.customers as { company: string; name: string } | null)?.company ??
            (j.customers as { name: string } | null)?.name ??
            '—'

          return (
            <li
              key={j.id}
              className={`rounded-2xl px-5 py-4 ${styles.jobCard}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-semibold text-sm ${styles.jobTitle}`}
                  >
                    {j.title}
                  </p>
                  <p
                    className={`mt-0.5 text-sm ${styles.jobCustomer}`}
                  >
                    {customer}
                  </p>
                  {j.description && (
                    <p
                      className={`mt-2 text-sm line-clamp-2 ${styles.jobDescription}`}
                    >
                      {j.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.jobStatus} ${st.className}`}
                >
                  {st.label}
                </span>
              </div>

              <div
                className={`mt-3 pt-3 ${styles.jobDivider}`}
              >
                <Link
                  href={`/quotes/new?jobId=${j.id}`}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${styles.jobLink}`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create quote
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
