import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { deleteDraftQuote } from '@/lib/actions/quotes'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { getDict } from '@/i18n/server'
import { DeleteDraftQuoteButton } from '@/components/quotes/DeleteDraftQuoteButton'
import { QuoteFilterSelect } from './QuoteFilterSelect'
import styles from './quotes.module.css'

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const t = await getDict()
  const { status: statusFilter } = await searchParams
  const validStatuses = ['draft', 'sent', 'accepted', 'rejected']
  const activeFilter = validStatuses.includes(statusFilter ?? '') ? statusFilter! : ''

  const STATUS_META: Record<string, { rowClass: string; badgeClass: string; dotClass: string; label: string; hint: string; amountClass: string }> = {
    draft:    { rowClass: styles.rowDraft,    badgeClass: styles.statusDraft,    dotClass: styles.dotDraft,    label: t.quotes.status.draft,    hint: t.quotes.statusHint.draft,    amountClass: styles.amountDraft },
    sent:     { rowClass: styles.rowSent,     badgeClass: styles.statusSent,     dotClass: styles.dotSent,     label: t.quotes.status.sent,     hint: t.quotes.statusHint.sent,     amountClass: styles.amountSent },
    accepted: { rowClass: styles.rowAccepted, badgeClass: styles.statusAccepted, dotClass: styles.dotAccepted, label: t.quotes.status.accepted, hint: t.quotes.statusHint.accepted, amountClass: styles.amountAccepted },
    rejected: { rowClass: styles.rowRejected, badgeClass: styles.statusRejected, dotClass: styles.dotRejected, label: t.quotes.status.rejected, hint: t.quotes.statusHint.rejected, amountClass: styles.amountRejected },
  }

  let listQuery = supabase
    .from('quotes')
    .select(`
      id, status, total, created_at,
      jobs ( title, customers ( name, company ) )
    `)
    .order('created_at', { ascending: false })
  if (activeFilter) listQuery = listQuery.eq('status', activeFilter)

  const [{ data: quotes }, { data: allQuotes }] = await Promise.all([
    listQuery,
    supabase.from('quotes').select('status, total'),
  ])

  const all = quotes ?? []
  const totals = allQuotes ?? []
  const acceptedValue = totals.filter((q) => q.status === 'accepted').reduce((s, q) => s + (q.total ?? 0), 0)
  const pipelineValue = totals.filter((q) => q.status === 'sent').reduce((s, q) => s + (q.total ?? 0), 0)
  const acceptedCount = totals.filter((q) => q.status === 'accepted').length
  const sentCount = totals.filter((q) => q.status === 'sent').length
  const draftCount    = totals.filter((q) => q.status === 'draft').length
  const rejectedCount = totals.filter((q) => q.status === 'rejected').length

  return (
    <div className={styles.shell}>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.quotes.title}</h1>
          {all.length === 0 && (
            <p className={styles.pageSubtitle}>{t.quotes.total(all.length)}</p>
          )}
        </div>
        <Link
          href="/quotes/new"
          className={`btn-primary ${styles.pageHeaderCta}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.quotes.new}
        </Link>
      </div>

      {/* ── Pipeline bar ── */}
      {totals.length > 0 && (
        <div className={styles.pipelineBar} role="group" aria-label="Quote pipeline">
          <div className={`${styles.pipelineSegment} ${styles.segDraft}`}>
            <span className={styles.pipelineLabel}>
              <span className={`${styles.statusDot} ${styles.dotDraft}`} aria-hidden />
              {t.quotes.status.draft}
            </span>
            <span className={styles.pipelineCount}>{draftCount}</span>
          </div>
          <div className={`${styles.pipelineSegment} ${styles.segSent}`}>
            <span className={styles.pipelineLabel}>
              <span className={`${styles.statusDot} ${styles.dotSent}`} aria-hidden />
              {t.quotes.status.sent}
            </span>
            <span className={styles.pipelineCount}>{sentCount}</span>
            {sentCount > 0 && <span className={styles.pipelineCurrency}>{formatCurrency(pipelineValue)}</span>}
          </div>
          <div className={`${styles.pipelineSegment} ${styles.segAccepted}`}>
            <span className={styles.pipelineLabel}>
              <span className={`${styles.statusDot} ${styles.dotAccepted}`} aria-hidden />
              {t.quotes.status.accepted}
            </span>
            <span className={styles.pipelineCount}>{acceptedCount}</span>
            {acceptedCount > 0 && <span className={styles.pipelineCurrency}>{formatCurrency(acceptedValue)}</span>}
          </div>
          <div className={`${styles.pipelineSegment} ${styles.segRejected}`}>
            <span className={styles.pipelineLabel}>
              <span className={`${styles.statusDot} ${styles.dotRejected}`} aria-hidden />
              {t.quotes.status.rejected}
            </span>
            <span className={styles.pipelineCount}>{rejectedCount}</span>
          </div>
        </div>
      )}

      {/* ── Status filter ── */}
      <details className={styles.filterDetails} open={!!activeFilter}>
        <summary className={styles.filterSummary}>
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          {t.quotes.filter}
        </summary>
        <div className={styles.filterBody}>
          <QuoteFilterSelect
            value={activeFilter}
            ariaLabel={t.quotes.filter}
            options={[
              { value: '', label: t.quotes.filterAll },
              { value: 'draft', label: t.quotes.status.draft },
              { value: 'sent', label: t.quotes.status.sent },
              { value: 'accepted', label: t.quotes.status.accepted },
              { value: 'rejected', label: t.quotes.status.rejected },
            ]}
          />
        </div>
      </details>

      {/* ── Empty state ── */}
      {!all.length && (
        <div className={`flex flex-col items-center justify-center py-20 text-center ${styles.emptyState}`}>
          <div className={styles.emptyIconWrap}>
            <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className={`mt-4 text-sm font-semibold ${styles.emptyIconLabel}`}>{t.quotes.noQuotes}</p>
          <p className={`mt-1 text-sm ${styles.emptyStateHint}`}>{t.quotes.createFirst}</p>
          <Link
            href="/quotes/new"
            className="btn-primary mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t.quotes.new}
          </Link>
        </div>
      )}

      {/* ── Table ── */}
      {all.length > 0 && (
        <div className={styles.tableWrap}>
          {/* Column headers — desktop only */}
          <div className={styles.tableHead}>
            <span>{t.quotes.jobCol}</span>
            <span className={styles.colDate}>{t.quotes.dateCol}</span>
            <span className={styles.colStatus}>Status</span>
            <span className={styles.colAmount}>{t.quotes.amountCol}</span>
          </div>

          <ul role="list" className={styles.tableBody}>
            {all.map((q) => {
              const st = STATUS_META[q.status ?? 'draft'] ?? STATUS_META.draft
              const isDraft = (q.status ?? 'draft') === 'draft'
              const jobTitle =
                (q.jobs as { title: string } | null)?.title ?? t.quotes.untitledJob
              const customer =
                (q.jobs as { customers: { name: string; company: string } | null } | null)
                  ?.customers?.company ??
                (q.jobs as { customers: { name: string } | null } | null)?.customers?.name ??
                '—'
              const deleteAction = deleteDraftQuote.bind(null, q.id)

              return (
                <li key={q.id} className={`${styles.tableRow} ${st.rowClass}`}>
                  <Link href={`/quotes/${q.id}`} className={styles.rowLink}>
                    {/* Job + customer */}
                    <span className={styles.colJob}>
                      <span className={`${styles.jobTitle} truncate`}>{jobTitle}</span>
                      <span className={`${styles.customerName} truncate`}>{customer}</span>
                    </span>

                    {/* Date */}
                    <span className={`${styles.colDate} ${styles.dateText}`}>
                      {q.created_at ? formatDate(q.created_at) : '—'}
                    </span>

                    {/* Status badge + hint */}
                    <span className={styles.colStatus}>
                      <span className={styles.statusGroup}>
                        <span className={`${styles.statusBadge} ${st.badgeClass}`}>
                          <span className={`${styles.statusDot} ${st.dotClass}`} aria-hidden />
                          {st.label}
                        </span>
                        <span className={styles.statusHint}>{st.hint}</span>
                      </span>
                    </span>

                    {/* Amount — colored per status */}
                    <span className={`${styles.colAmount} ${styles.quoteAmount} ${st.amountClass}`}>
                      {formatCurrency(q.total ?? 0)}
                    </span>

                    {/* Chevron */}
                    <svg
                      className={styles.rowChevron}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>

                  {isDraft && (
                    <DeleteDraftQuoteButton
                      action={deleteAction}
                      jobTitle={jobTitle}
                      labels={{
                        trigger: t.quotes.delete,
                        modalTitle: t.quotes.confirmDelete,
                        modalDesc: t.quotes.confirmDeleteDesc,
                        cancel: t.quotes.cancelLabel,
                        confirm: t.quotes.deleteConfirm,
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
