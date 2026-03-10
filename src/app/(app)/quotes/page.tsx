import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { deleteDraftQuote } from '@/lib/actions/quotes'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { getDict } from '@/i18n/server'
import { NewQuoteForm } from '@/components/NewQuoteForm/NewQuoteForm'
import { getCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { DEFAULT_CALCULATOR_SETTINGS } from '@/lib/calculatorSettings'
import styles from './quotes.module.css'

export default async function QuotesPage() {
  const supabase = await createServerSupabaseClient()
  const t = await getDict()

  const STATUS_META: Record<string, { rowClass: string; badgeClass: string; dotClass: string; label: string; hint: string; amountClass: string }> = {
    draft:    { rowClass: styles.rowDraft,    badgeClass: styles.statusDraft,    dotClass: styles.dotDraft,    label: t.quotes.status.draft,    hint: t.quotes.statusHint.draft,    amountClass: styles.amountDraft },
    sent:     { rowClass: styles.rowSent,     badgeClass: styles.statusSent,     dotClass: styles.dotSent,     label: t.quotes.status.sent,     hint: t.quotes.statusHint.sent,     amountClass: styles.amountSent },
    accepted: { rowClass: styles.rowAccepted, badgeClass: styles.statusAccepted, dotClass: styles.dotAccepted, label: t.quotes.status.accepted, hint: t.quotes.statusHint.accepted, amountClass: styles.amountAccepted },
    rejected: { rowClass: styles.rowRejected, badgeClass: styles.statusRejected, dotClass: styles.dotRejected, label: t.quotes.status.rejected, hint: t.quotes.statusHint.rejected, amountClass: styles.amountRejected },
  }

  const [{ data: quotes }, { data: jobs }, { data: customers }, calculatorSettings] = await Promise.all([
    supabase
      .from('quotes')
      .select(`
        id, status, total, created_at,
        jobs ( title, customers ( name, company ) )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select('id, title, customers ( name, company )')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    supabase
      .from('customers')
      .select('id, name, company')
      .order('name'),
    getCalculatorSettings().catch(() => ({ values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null })),
  ])

  const all = quotes ?? []
  const acceptedValue = all.filter((q) => q.status === 'accepted').reduce((s, q) => s + (q.total ?? 0), 0)
  const pipelineValue = all.filter((q) => q.status === 'sent').reduce((s, q) => s + (q.total ?? 0), 0)
  const acceptedCount = all.filter((q) => q.status === 'accepted').length
  const sentCount = all.filter((q) => q.status === 'sent').length
  const draftCount    = all.filter((q) => q.status === 'draft').length
  const rejectedCount = all.filter((q) => q.status === 'rejected').length

  return (
    <div>
      {/* ── Page header ── */}
      <div className={`mb-6 flex items-start justify-between ${styles.pageHeader}`}>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
            {t.quotes.title}
          </h1>
          {all.length > 0 ? (
            <div className={styles.pageHeaderMeta}>
              {acceptedCount > 0 && (
                <span className={`${styles.metaChip} ${styles.metaAccepted}`}>
                  <span className={`${styles.statusDot} ${styles.dotAccepted}`} aria-hidden />
                  {acceptedCount} {t.quotes.status.accepted}
                </span>
              )}
              {sentCount > 0 && (
                <span className={`${styles.metaChip} ${styles.metaSent}`}>
                  <span className={`${styles.statusDot} ${styles.dotSent}`} aria-hidden />
                  {sentCount} {t.quotes.status.sent}
                </span>
              )}
              {draftCount > 0 && (
                <span className={`${styles.metaChip} ${styles.metaDraft}`}>
                  <span className={`${styles.statusDot} ${styles.dotDraft}`} aria-hidden />
                  {draftCount} {t.quotes.status.draft}
                </span>
              )}
              {rejectedCount > 0 && (
                <span className={`${styles.metaChip} ${styles.metaRejected}`}>
                  <span className={`${styles.statusDot} ${styles.dotRejected}`} aria-hidden />
                  {rejectedCount} {t.quotes.status.rejected}
                </span>
              )}
            </div>
          ) : (
            <p className={`mt-1 text-sm ${styles.quoteCount}`}>
              {t.quotes.total(all.length)}
            </p>
          )}
        </div>
      </div>

      {/* ── Summary strip ── */}
      {all.length > 0 && (
        <div className={`mb-6 grid grid-cols-3 gap-3 ${styles.summaryStrip}`}>
          {/* Accepted revenue card */}
          <div className={`${styles.summaryCard} ${styles.summaryCardAccepted}`}>
            <div className={styles.summaryHeader}>
              <p className={styles.summaryLabel}>{t.quotes.acceptedRevenue}</p>
              <span className={`${styles.summaryStatusBadge} ${styles.statusAccepted}`}
                    aria-label={t.quotes.status.accepted}>
                <span className={`${styles.statusDot} ${styles.dotAccepted}`} aria-hidden />
                {t.quotes.status.accepted}
              </span>
            </div>
            <p className={`${styles.summaryValue} ${styles.summaryAccepted}`}>{formatCurrency(acceptedValue)}</p>
            <hr className={styles.summaryDivider} />
            <p className={styles.summaryDescription}>{t.quotes.summaryDescription.acceptedRevenueMain(acceptedCount)}</p>
            <p className={styles.summaryDescriptionSub}>{t.quotes.summaryDescription.acceptedRevenueRule}</p>
          </div>

          {/* Pipeline / sent card */}
          <div className={`${styles.summaryCard} ${styles.summaryCardSent}`}>
            <div className={styles.summaryHeader}>
              <p className={styles.summaryLabel}>{t.quotes.pipelineValue}</p>
              <span className={`${styles.summaryStatusBadge} ${styles.statusSent}`}
                    aria-label={t.quotes.status.sent}>
                <span className={`${styles.statusDot} ${styles.dotSent}`} aria-hidden />
                {t.quotes.status.sent}
              </span>
            </div>
            <p className={`${styles.summaryValue} ${styles.summarySent}`}>{formatCurrency(pipelineValue)}</p>
            <hr className={styles.summaryDivider} />
            <p className={styles.summaryDescription}>{t.quotes.summaryDescription.pipelineValueMain(sentCount)}</p>
            <p className={styles.summaryDescriptionSub}>{t.quotes.summaryDescription.pipelineValueRule}</p>
          </div>

          {/* Drafts card */}
          <div className={`${styles.summaryCard} ${styles.summaryCardDraft}`}>
            <div className={styles.summaryHeader}>
              <p className={styles.summaryLabel}>{t.quotes.drafts}</p>
              <span className={`${styles.summaryStatusBadge} ${styles.statusDraft}`}
                    aria-label={t.quotes.status.draft}>
                <span className={`${styles.statusDot} ${styles.dotDraft}`} aria-hidden />
                {t.quotes.status.draft}
              </span>
            </div>
            <p className={styles.summaryValue}>{draftCount}</p>
            <hr className={styles.summaryDivider} />
            <p className={styles.summaryDescription}>{t.quotes.summaryDescription.draftsMain(draftCount)}</p>
            <p className={styles.summaryDescriptionSub}>{t.quotes.summaryDescription.draftsRule}</p>
          </div>
        </div>
      )}

      {/* ── New quote (collapsible) ── */}
      <details className={styles.createDetails}>
        <summary className={styles.createSummary}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.quotes.new}
        </summary>
        <div className={styles.createCard}>
          <NewQuoteForm
            jobs={jobs ?? []}
            customers={customers ?? []}
            calculatorDefaults={calculatorSettings.values}
          />
        </div>
      </details>

      {/* ── Empty state ── */}
      {!all.length && (
        <div className={`flex flex-col items-center justify-center rounded-2xl py-20 text-center ${styles.emptyState}`}>
          <div className={styles.emptyIconWrap}>
            <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className={`mt-4 text-sm font-semibold ${styles.emptyIconLabel}`}>{t.quotes.noQuotes}</p>
          <p className={`mt-1 text-sm ${styles.emptyStateHint}`}>{t.quotes.createFirst}</p>
          <Link
            href="/quotes/new"
            className="btn-primary mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold"
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
                    <form action={deleteAction} className={styles.deleteForm}>
                      <button
                        type="submit"
                        className={styles.deleteBtn}
                        aria-label={`${t.quotes.delete} ${jobTitle}`}
                        title={t.quotes.delete}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
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
