import { useEffect, useState } from 'react'
import { createCustomer, createJob } from '@/lib/actions/jobs'
import { useT } from '@/i18n/context'
import styles from './NewQuoteForm.module.css'
import {
  CREATE_NEW_CUSTOMER_VALUE,
  CREATE_NEW_JOB_VALUE,
  type Customer,
  type CreatedCustomer,
  type CreatedJob,
  type Job,
} from './NewQuoteForm.types'

interface JobSelectorSectionProps {
  jobs: Job[]
  customers: Customer[]
  initialJobId?: string
  onJobSelected: (jobId: string, title: string) => void
}

export function JobSelectorSection({ jobs, customers, initialJobId, onJobSelected }: JobSelectorSectionProps) {
  const t = useT()
  const [jobOptions, setJobOptions] = useState(jobs)
  const [customerOptions, setCustomerOptions] = useState(customers)
  const [selectedJobId, setSelectedJobId] = useState(() =>
    initialJobId && jobs.some((job) => job.id === initialJobId) ? initialJobId : '',
  )
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobCustomerId, setNewJobCustomerId] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerCompany, setNewCustomerCompany] = useState('')
  const [creatingJob, setCreatingJob] = useState(false)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [createJobError, setCreateJobError] = useState('')
  const [createCustomerError, setCreateCustomerError] = useState('')

  const isCreatingNewJob = selectedJobId === CREATE_NEW_JOB_VALUE
  const isCreatingNewCustomer = newJobCustomerId === CREATE_NEW_CUSTOMER_VALUE

  useEffect(() => {
    if (!selectedJobId || selectedJobId === CREATE_NEW_JOB_VALUE) {
      onJobSelected('', '')
      return
    }

    const selectedJob = jobOptions.find((job) => job.id === selectedJobId)
    onJobSelected(selectedJobId, selectedJob?.title ?? '')
  }, [jobOptions, onJobSelected, selectedJobId])

  function handleSelectJob(nextJobId: string) {
    if (nextJobId === CREATE_NEW_JOB_VALUE) {
      setSelectedJobId(CREATE_NEW_JOB_VALUE)
      setCreateJobError('')
      return
    }

    setSelectedJobId(nextJobId)
    setCreateJobError('')
  }

  async function handleCreateJob() {
    const title = newJobTitle.trim()
    if (!title || !newJobCustomerId || isCreatingNewCustomer) return

    setCreatingJob(true)
    setCreateJobError('')

    try {
      const createdJob = (await createJob({
        title,
        description: '',
        customerId: newJobCustomerId,
      })) as CreatedJob

      const selectedCustomer = customerOptions.find((customer) => customer.id === newJobCustomerId)
      const nextJob: Job = {
        id: createdJob.id,
        title: createdJob.title,
        customers: selectedCustomer
          ? {
              name: selectedCustomer.name,
              company: selectedCustomer.company,
            }
          : null,
      }

      setJobOptions((prev) => [nextJob, ...prev])
      setSelectedJobId(nextJob.id)
      setNewJobTitle('')
      setNewJobCustomerId('')
    } catch (error) {
      setCreateJobError(error instanceof Error ? error.message : t.newQuote.failedToCreateJob)
    } finally {
      setCreatingJob(false)
    }
  }

  async function handleCreateCustomer() {
    const name = newCustomerName.trim()
    if (!name) return

    setCreatingCustomer(true)
    setCreateCustomerError('')

    try {
      const createdCustomer = (await createCustomer({
        name,
        company: newCustomerCompany.trim(),
        email: '',
        phone: '',
        address: '',
        vat_number: '',
      })) as CreatedCustomer

      const nextCustomer: Customer = {
        id: createdCustomer.id,
        name: createdCustomer.name,
        company: createdCustomer.company,
      }

      setCustomerOptions((prev) => [nextCustomer, ...prev])
      setNewJobCustomerId(nextCustomer.id)
      setNewCustomerName('')
      setNewCustomerCompany('')
    } catch (error) {
      setCreateCustomerError(error instanceof Error ? error.message : t.newQuote.failedToCreateCustomer)
    } finally {
      setCreatingCustomer(false)
    }
  }

  return (
    <div className="mb-6">
      {!isCreatingNewJob ? (
        <>
          <label className={styles.jobLabel}>
            {t.newQuote.job}
          </label>
          <div className={styles.jobSelectWrap}>
            <select
              required
              value={selectedJobId}
              onChange={(e) => handleSelectJob(e.target.value)}
              aria-label={t.newQuote.selectJob}
              className={styles.jobSelect}
            >
              <option value="">{t.newQuote.selectJob}</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.customers?.company ?? job.customers?.name ?? '?'}
                </option>
              ))}
              <option value={CREATE_NEW_JOB_VALUE}>{t.newQuote.createNewJob}</option>
            </select>
          </div>
        </>
      ) : null}

      {isCreatingNewJob && (
        <div className={styles.createJobPanel}>
          <div className={styles.createJobHeader}>
            <span className={styles.jobLabel}>{t.newQuote.createNewJob.replace(/^\+ /, '')}</span>
            <button
              type="button"
              onClick={() => handleSelectJob('')}
              className="btn-ghost px-2.5 py-1 text-xs font-medium"
            >
              ← {t.newQuote.cancel}
            </button>
          </div>
          <div className={styles.createJobCard}>
            <div className={styles.createJobForm}>
              <div className={styles.createJobGrid}>
                <label className="text-sm md:col-span-2">
                  <span className={styles.createJobFieldLabel}>{t.newQuote.jobTitle}</span>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder={t.newQuote.jobTitlePlaceholder}
                    className="input-field w-full px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  <span className={styles.createJobFieldLabel}>{t.newQuote.customer}</span>
                  <select
                    value={newJobCustomerId}
                    onChange={(e) => {
                      setNewJobCustomerId(e.target.value)
                      setCreateCustomerError('')
                      setCreateJobError('')
                    }}
                    aria-label={t.newQuote.selectCustomer}
                    className="input-field w-full px-3 py-2 text-sm"
                  >
                    <option value="" disabled>{t.newQuote.selectCustomer}</option>
                    {customerOptions.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company ?? customer.name}
                      </option>
                    ))}
                    <option value={CREATE_NEW_CUSTOMER_VALUE}>{t.newQuote.createNewCustomer}</option>
                  </select>
                </label>
              </div>

              {isCreatingNewCustomer && (
                <div className={`mt-3 ${styles.createJobGrid}`}>
                  <label className="text-sm md:col-span-2">
                    <span className={styles.createJobFieldLabel}>{t.newQuote.customerName}</span>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder={t.newQuote.customerNamePlaceholder}
                      className="input-field w-full px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    <span className={styles.createJobFieldLabel}>{t.newQuote.companyOptional}</span>
                    <input
                      type="text"
                      value={newCustomerCompany}
                      onChange={(e) => setNewCustomerCompany(e.target.value)}
                      placeholder={t.newQuote.companyPlaceholder}
                      className="input-field w-full px-3 py-2 text-sm"
                    />
                  </label>

                  {createCustomerError && (
                    <p role="alert" className={`text-xs md:col-span-2 ${styles.createJobFieldLabel}`}>
                      {createCustomerError}
                    </p>
                  )}

                  <div className={`md:col-span-2 ${styles.createJobActions}`}>
                    <button
                      type="button"
                      onClick={handleCreateCustomer}
                      disabled={creatingCustomer || !newCustomerName.trim()}
                      className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {creatingCustomer ? t.newQuote.creating3DPrint : t.newQuote.createCustomerAndSelect}
                    </button>
                  </div>
                </div>
              )}

              {createJobError && (
                <p role="alert" className={`mt-2 text-xs ${styles.createJobFieldLabel}`}>
                  {createJobError}
                </p>
              )}

              {!isCreatingNewCustomer && (
                <div className={styles.createJobActions}>
                  <button
                    type="button"
                    onClick={handleCreateJob}
                    disabled={creatingJob || !newJobTitle.trim() || !newJobCustomerId}
                    className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  >
                    {creatingJob ? t.newQuote.creating3DPrint : t.newQuote.createJobAndSelect}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
