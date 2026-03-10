import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createJob, updateJob, deleteJob } from '@/lib/actions/jobs'
import { DeleteJobButton } from '@/components/jobs/DeleteJobButton'
import { redirect } from 'next/navigation'
import { getDict } from '@/i18n/server'
import styles from './jobs.module.css'

const JOB_STATUS_VALUES = ['open', 'won', 'lost', 'archived'] as const

interface JobsPageProps {
  searchParams?: Promise<{ status?: string; message?: string; jobStatus?: string; q?: string; sort?: string; new?: string }>
}

function getErrorMessage(caught: unknown) {
  if (caught instanceof Error && caught.message) return caught.message
  return 'Something went wrong'
}

function readField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function redirectWithStatus(status: 'success' | 'error', message: string) {
  redirect(`/jobs?status=${status}&message=${encodeURIComponent(message)}`)
}

function redirectFromError(caught: unknown) {
  redirectWithStatus('error', getErrorMessage(caught))
}

function getJobStatus(value: string) {
  if ((JOB_STATUS_VALUES as readonly string[]).includes(value)) {
    return value as (typeof JOB_STATUS_VALUES)[number]
  }
  return 'open'
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await searchParams
  const status = resolvedSearchParams?.status
  const message = resolvedSearchParams?.message
  const selectedJobStatus =
    resolvedSearchParams?.jobStatus &&
    (JOB_STATUS_VALUES as readonly string[]).includes(resolvedSearchParams.jobStatus)
      ? (resolvedSearchParams.jobStatus as (typeof JOB_STATUS_VALUES)[number])
      : null
  const newJobOpen = resolvedSearchParams?.new === '1'
  const searchQuery = (resolvedSearchParams?.q ?? '').trim().toLowerCase()
  const sortParam = (['newest', 'oldest', 'title'] as const).includes(
    resolvedSearchParams?.sort as 'newest' | 'oldest' | 'title'
  )
    ? (resolvedSearchParams!.sort as 'newest' | 'oldest' | 'title')
    : 'newest'

  async function handleCreateJob(formData: FormData) {
    'use server'

    const title = readField(formData, 'title').trim()
    const customerId = readField(formData, 'customerId')
    const description = readField(formData, 'description')

    if (!title || !customerId) {
      redirectWithStatus('error', 'Job title and customer are required')
    }

    try {
      await createJob({ title, description, customerId })
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Job created')
  }

  async function handleUpdateJob(formData: FormData) {
    'use server'

    const id = readField(formData, 'id')
    const title = readField(formData, 'title').trim()
    const customerId = readField(formData, 'customerId')
    const description = readField(formData, 'description')
    const statusValue = getJobStatus(readField(formData, 'status'))

    if (!id || !title || !customerId) {
      redirectWithStatus('error', 'Job title and customer are required')
    }

    try {
      await updateJob({ id, title, customerId, description, status: statusValue })
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Job updated')
  }

  async function handleDeleteJob(formData: FormData) {
    'use server'

    const id = readField(formData, 'id')
    const password = readField(formData, 'password')
    if (!id) {
      redirectWithStatus('error', 'Missing job id')
    }

    try {
      await deleteJob(id, password)
    } catch (caught) {
      redirectFromError(caught)
    }

    redirectWithStatus('success', 'Job deleted')
  }

  const supabase = await createServerSupabaseClient()
  const t = await getDict()

  const JOB_STATUS: Record<string, { label: string; badgeClass: string }> = {
    open: { label: t.jobs.statusValues.open, badgeClass: styles.statusOpen },
    won: { label: t.jobs.statusValues.won, badgeClass: styles.statusWon },
    lost: { label: t.jobs.statusValues.lost, badgeClass: styles.statusLost },
    archived: { label: t.jobs.statusValues.archived, badgeClass: styles.statusArchived },
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, status, customer_id, created_at, customers ( name, company )')
    .order(sortParam === 'title' ? 'title' : 'created_at', {
      ascending: sortParam === 'oldest' || sortParam === 'title',
    })

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company')
    .order('name')

  const statusCounts = {
    open:     jobs?.filter((j) => (j.status ?? 'open') === 'open').length ?? 0,
    won:      jobs?.filter((j) => j.status === 'won').length ?? 0,
    lost:     jobs?.filter((j) => j.status === 'lost').length ?? 0,
    archived: jobs?.filter((j) => j.status === 'archived').length ?? 0,
  }

  const visibleJobs = jobs?.filter((j) => {
    const matchesStatus = selectedJobStatus === null || (j.status ?? 'open') === selectedJobStatus
    if (!matchesStatus) return false
    if (!searchQuery) return true
    const customerName =
      (j.customers as { company: string; name: string } | null)?.company ??
      (j.customers as { name: string } | null)?.name ??
      ''
    return (
      j.title.toLowerCase().includes(searchQuery) ||
      customerName.toLowerCase().includes(searchQuery) ||
      (j.description ?? '').toLowerCase().includes(searchQuery)
    )
  })

  function buildHref(overrides: Partial<{
    jobStatus: string | null
    sort: string
    q: string
    new: string
  }> = {}) {
    const next = new URLSearchParams()
    if (status) next.set('status', status)
    if (message) next.set('message', message)
    const q = overrides.q !== undefined ? overrides.q : searchQuery
    if (q) next.set('q', q)
    const sort = overrides.sort !== undefined ? overrides.sort : sortParam
    if (sort !== 'newest') next.set('sort', sort)
    const js = overrides.jobStatus !== undefined ? overrides.jobStatus : selectedJobStatus
    if (js) next.set('jobStatus', js)
    if (overrides.new) next.set('new', overrides.new)
    const query = next.toString()
    return query ? `/jobs?${query}` : '/jobs'
  }

  function getStatusFilterHref(jobStatus: (typeof JOB_STATUS_VALUES)[number]) {
    return buildHref({ jobStatus: selectedJobStatus === jobStatus ? null : jobStatus })
  }

  function getAllHref() {
    return buildHref({ jobStatus: null })
  }

  function getSortHref(sort: 'newest' | 'oldest' | 'title') {
    return buildHref({ sort })
  }

  return (
    <div className={styles.shell}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.jobs.title}</h1>
        <p className={styles.pageSubtitle}>{t.jobs.total(jobs?.length ?? 0)}</p>
      </div>

      {message && (
        <p className={`${styles.feedback} ${status === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {message}
        </p>
      )}

      {/* ── Stats strip ── */}
      {!!jobs?.length && (
        <div className={styles.statsStrip}>
          <Link
            href={getAllHref()}
            className={`${styles.statCard} ${styles.statCardLink} ${styles.statAll} ${selectedJobStatus === null && !searchQuery ? styles.statCardActive : ''}`}
          >
            <span className={styles.statValue}>{jobs.length}</span>
            <span className={styles.statLabel}>{t.jobs.allJobs}</span>
          </Link>
          {([
            { key: 'open',     cnt: statusCounts.open,     cls: styles.statOpen,     label: t.jobs.statusValues.open },
            { key: 'won',      cnt: statusCounts.won,      cls: styles.statWon,      label: t.jobs.statusValues.won },
            { key: 'lost',     cnt: statusCounts.lost,     cls: styles.statLost,     label: t.jobs.statusValues.lost },
            { key: 'archived', cnt: statusCounts.archived, cls: styles.statArchived, label: t.jobs.statusValues.archived },
          ] as const).map(({ key, cnt, cls, label }) => (
            <Link
              key={key}
              href={getStatusFilterHref(key)}
              className={`${styles.statCard} ${styles.statCardLink} ${cls} ${selectedJobStatus === key ? styles.statCardActive : ''}`}
            >
              <span className={styles.statValue}>{cnt}</span>
              <span className={styles.statLabel}>{label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Search + Sort controls ── */}
      {!!jobs?.length && (
        <div className={styles.controlsRow}>
          <form method="get" action="/jobs" className={styles.searchForm}>
            {selectedJobStatus && <input type="hidden" name="jobStatus" value={selectedJobStatus} />}
            {sortParam !== 'newest' && <input type="hidden" name="sort" value={sortParam} />}
            <div className={styles.searchInputWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={resolvedSearchParams?.q ?? ''}
                placeholder={t.jobs.searchPlaceholder}
                className={styles.searchInput}
              />
            </div>
          </form>
          <div className={styles.sortGroup}>
            {([
              { key: 'newest', label: t.jobs.sortNewest },
              { key: 'oldest', label: t.jobs.sortOldest },
              { key: 'title',  label: t.jobs.sortByTitle },
            ] as const).map(({ key, label }) => (
              <Link
                key={key}
                href={getSortHref(key)}
                className={`${styles.sortBtn} ${sortParam === key ? styles.sortBtnActive : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Add job (collapsible) ── */}
      <details className={styles.createDetails} {...(newJobOpen ? { open: true } : {})}>
        <summary className={styles.createSummary}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.jobs.addJob}
        </summary>
        <div className={styles.createCard}>
          <form action={handleCreateJob} className={styles.jobForm}>
            <div className={styles.formGrid}>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.jobs.titleField}</span>
                <input name="title" required className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.jobs.titlePlaceholder} />
              </label>
              <label className="text-sm">
                <span className={styles.fieldLabel}>{t.jobs.customer}</span>
                <select name="customerId" required className="input-field w-full rounded-lg px-3 py-2 text-sm" defaultValue="">
                  <option value="" disabled>{t.jobs.selectCustomer}</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>{c.company ?? c.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                <span className={styles.fieldLabel}>{t.jobs.description}</span>
                <textarea name="description" rows={2} className="input-field w-full rounded-lg px-3 py-2 text-sm" placeholder={t.jobs.descriptionPlaceholder} />
              </label>
            </div>
            <div className={styles.actionRow}>
              <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">{t.jobs.createJob}</button>
            </div>
          </form>
        </div>
      </details>

      {!jobs?.length && (
        <div className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyCard}`}>
          <svg className={`mb-3 w-10 h-10 ${styles.emptyIcon}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>{t.jobs.noJobs}</p>
        </div>
      )}

      {/* ── Filtered / search empty state ── */}
      {!!jobs?.length && !visibleJobs?.length && (
        <div className={`flex flex-col items-center justify-center rounded-2xl py-14 text-center ${styles.emptyCard}`}>
          <svg className={`mb-3 w-10 h-10 ${styles.emptyIcon}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>{t.jobs.noJobsFiltered}</p>
          <Link href="/jobs" className={`mt-3 text-sm font-semibold ${styles.clearFiltersLink}`}>
            {t.jobs.clearFilters}
          </Link>
        </div>
      )}

      {/* ── Jobs table ── */}
      {!!visibleJobs?.length && (
        <div className={styles.tableWrap}>
          {visibleJobs.map((j) => {
            const st = JOB_STATUS[j.status ?? 'open'] ?? JOB_STATUS.open
            const customer =
              (j.customers as { company: string; name: string } | null)?.company ??
              (j.customers as { name: string } | null)?.name ??
              '—'
            const isOpenJob = (j.status ?? 'open') === 'open'
            const sk = j.status ?? 'open'
            const rowClass = styles[`row${sk.charAt(0).toUpperCase()}${sk.slice(1)}` as keyof typeof styles]
            const dateStr = new Intl.DateTimeFormat('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            }).format(new Date(j.created_at))
            const deleteLabels = {
              trigger: t.jobs.deleteTrigger,
              modalTitle: t.jobs.confirmDelete,
              modalDesc: t.jobs.confirmDeleteDesc,
              passwordLabel: t.jobs.passwordLabel,
              cancel: t.jobs.cancelLabel,
              confirm: t.jobs.deleteConfirm,
            }

            return (
              <div key={j.id} className={`${styles.tableRow} ${rowClass ?? ''}`}>
                <div className={styles.rowMain}>
                  <div className={styles.rowInfo}>
                    {isOpenJob ? (
                      <Link href={`/quotes/new?jobId=${j.id}`} className={`${styles.rowTitle} ${styles.rowTitleLink}`}>
                        {j.title}
                      </Link>
                    ) : (
                      <span className={styles.rowTitle}>{j.title}</span>
                    )}
                    <span className={styles.rowCustomer}>{customer}</span>
                    {j.description && <span className={styles.rowDesc}>{j.description}</span>}
                    <span className={styles.rowDate}>{dateStr}</span>
                  </div>

                  <span className={`${styles.statusBadge} ${st.badgeClass}`}>
                    <span className={styles.statusDot} aria-hidden />
                    {st.label}
                  </span>

                  <div className={styles.rowActions}>
                    <Link href={`/quotes/new?jobId=${j.id}`} className={styles.actionLink}>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      {isOpenJob ? t.jobs.continueJob : t.jobs.createQuote}
                    </Link>
                    <DeleteJobButton jobId={j.id} action={handleDeleteJob} labels={deleteLabels} />
                    {/* Edit toggle — panel is a full-width sibling below, shown via CSS :has() */}
                    <details className={styles.editDetails}>
                      <summary className={styles.editSummary}>
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        {t.jobs.edit}
                      </summary>
                    </details>
                  </div>
                </div>

                {/* Edit panel: full-width, shown via CSS :has(.editDetails[open]) */}
                <div className={styles.editPanel}>
                  <form action={handleUpdateJob} className={styles.jobForm}>
                    <input type="hidden" name="id" value={j.id} />
                    <div className={styles.formGrid}>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.titleField}</span>
                        <input name="title" required defaultValue={j.title} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                      </label>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.customer}</span>
                        <select name="customerId" required defaultValue={j.customer_id} className="input-field w-full rounded-lg px-3 py-2 text-sm">
                          {customers?.map((c) => (
                            <option key={c.id} value={c.id}>{c.company ?? c.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.status}</span>
                        <select name="status" defaultValue={j.status ?? 'open'} className="input-field w-full rounded-lg px-3 py-2 text-sm">
                          {JOB_STATUS_VALUES.map((value) => (
                            <option key={value} value={value}>{t.jobs.statusValues[value]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm md:col-span-2">
                        <span className={styles.fieldLabel}>{t.jobs.description}</span>
                        <textarea name="description" rows={2} defaultValue={j.description ?? ''} className="input-field w-full rounded-lg px-3 py-2 text-sm" />
                      </label>
                    </div>
                    <div className={styles.actionRow}>
                      <button type="submit" className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold">{t.jobs.saveChanges}</button>
                    </div>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
