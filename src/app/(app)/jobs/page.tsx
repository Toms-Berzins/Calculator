import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createJob, updateJob, deleteJob } from '@/lib/actions/jobs'
import { DeleteJobButton } from '@/components/jobs/DeleteJobButton'
import { redirect } from 'next/navigation'
import { getDict } from '@/i18n/server'
import styles from './jobs.module.css'

const JOB_STATUS_VALUES = ['open', 'won', 'lost', 'archived'] as const

interface JobsPageProps {
  searchParams?: Promise<{ status?: string; message?: string }>
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

  const JOB_STATUS: Record<string, { label: string; className: string }> = {
    open: { label: t.jobs.statusValues.open, className: styles.statusOpen },
    won: { label: t.jobs.statusValues.won, className: styles.statusWon },
    lost: { label: t.jobs.statusValues.lost, className: styles.statusLost },
    archived: { label: t.jobs.statusValues.archived, className: styles.statusArchived },
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, status, customer_id, created_at, customers ( name, company )')
    .order('created_at', { ascending: false })

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          {t.jobs.title}
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {t.jobs.total(jobs?.length ?? 0)}
        </p>
      </div>

      {message && (
        <p className={`${styles.feedback} ${status === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {message}
        </p>
      )}

      <section className={`mb-6 rounded-2xl p-4 ${styles.createCard}`}>
        <h2 className={`text-sm font-semibold ${styles.pageTitle}`}>{t.jobs.addJob}</h2>
        <form action={handleCreateJob} className={styles.jobForm}>
          <div className={styles.formGrid}>
            <label className="text-sm">
              <span className={styles.fieldLabel}>{t.jobs.titleField}</span>
              <input
                name="title"
                required
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t.jobs.titlePlaceholder}
              />
            </label>
            <label className="text-sm">
              <span className={styles.fieldLabel}>{t.jobs.customer}</span>
              <select
                name="customerId"
                required
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>{t.jobs.selectCustomer}</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company ?? customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm md:col-span-2">
              <span className={styles.fieldLabel}>{t.jobs.description}</span>
              <textarea
                name="description"
                rows={2}
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t.jobs.descriptionPlaceholder}
              />
            </label>
          </div>
          <div className={styles.actionRow}>
            <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
              {t.jobs.createJob}
            </button>
          </div>
        </form>
      </section>

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
            {t.jobs.noJobs}
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
          const isOpenJob = (j.status ?? 'open') === 'open'

          return (
            <li
              key={j.id}
              className={`rounded-2xl px-5 py-4 ${styles.jobCard}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {isOpenJob ? (
                    <Link
                      href={`/quotes/new?jobId=${j.id}`}
                      className={`truncate font-semibold text-sm ${styles.jobTitle} ${styles.jobLink}`}
                    >
                      {j.title}
                    </Link>
                  ) : (
                    <p
                      className={`truncate font-semibold text-sm ${styles.jobTitle}`}
                    >
                      {j.title}
                    </p>
                  )}
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
                  {isOpenJob ? t.jobs.continueJob : t.jobs.createQuote}
                </Link>
              </div>

              <div className={styles.jobActions}>
                <details className={styles.editDetails}>
                  <summary className={styles.editSummary}>{t.jobs.edit}</summary>

                  <form action={handleUpdateJob} className={styles.jobForm}>
                    <input type="hidden" name="id" value={j.id} />

                    <div className={styles.formGrid}>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.titleField}</span>
                        <input
                          name="title"
                          required
                          defaultValue={j.title}
                          className="input-field w-full rounded-lg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.customer}</span>
                        <select
                          name="customerId"
                          required
                          defaultValue={j.customer_id}
                          className="input-field w-full rounded-lg px-3 py-2 text-sm"
                        >
                          {customers?.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.company ?? customer.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className={styles.fieldLabel}>{t.jobs.status}</span>
                        <select
                          name="status"
                          defaultValue={j.status ?? 'open'}
                          className="input-field w-full rounded-lg px-3 py-2 text-sm"
                        >
                          {JOB_STATUS_VALUES.map((value) => (
                            <option key={value} value={value}>
                              {t.jobs.statusValues[value]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm md:col-span-2">
                        <span className={styles.fieldLabel}>{t.jobs.description}</span>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={j.description ?? ''}
                          className="input-field w-full rounded-lg px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    <div className={styles.actionRow}>
                      <button type="submit" className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold">
                        {t.jobs.saveChanges}
                      </button>
                    </div>
                  </form>
                </details>

                <DeleteJobButton jobId={j.id} action={handleDeleteJob} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
