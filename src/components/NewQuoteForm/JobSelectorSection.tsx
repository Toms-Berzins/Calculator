import { useEffect, useState } from 'react'
import { createCustomer, createJob } from '@/lib/actions/jobs'
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
      setCreateJobError(error instanceof Error ? error.message : 'Failed to create job')
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
      setCreateCustomerError(error instanceof Error ? error.message : 'Failed to create customer')
    } finally {
      setCreatingCustomer(false)
    }
  }

  return (
    <div className="mb-6">
      <label className={`mb-1.5 block text-sm font-medium ${styles.jobLabel}`}>
        Job
      </label>
      <select
        required
        value={selectedJobId}
        onChange={(e) => handleSelectJob(e.target.value)}
        aria-label="Select a job"
        className="input-field w-full rounded-xl px-3 py-3 text-sm"
      >
        <option value="">Select a job…</option>
        {jobOptions.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title} — {job.customers?.company ?? job.customers?.name ?? '?'}
          </option>
        ))}
        <option value={CREATE_NEW_JOB_VALUE}>+ Create new job…</option>
      </select>

      {isCreatingNewJob && (
        <div className={`mt-3 rounded-xl p-3 ${styles.calculatorSummary}`}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              <span className={`mb-1 block ${styles.totalRow}`}>Job title</span>
              <input
                type="text"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="Example: Enclosure prototype"
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className={`mb-1 block ${styles.totalRow}`}>Customer</span>
              <select
                value={newJobCustomerId}
                onChange={(e) => {
                  setNewJobCustomerId(e.target.value)
                  setCreateCustomerError('')
                  setCreateJobError('')
                }}
                aria-label="Select customer for new job"
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select customer…</option>
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company ?? customer.name}
                  </option>
                ))}
                <option value={CREATE_NEW_CUSTOMER_VALUE}>+ Create new customer…</option>
              </select>
            </label>
          </div>

          {isCreatingNewCustomer && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm md:col-span-2">
                <span className={`mb-1 block ${styles.totalRow}`}>Customer name</span>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Example: John Smith"
                  className="input-field w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className={`mb-1 block ${styles.totalRow}`}>Company (optional)</span>
                <input
                  type="text"
                  value={newCustomerCompany}
                  onChange={(e) => setNewCustomerCompany(e.target.value)}
                  placeholder="Example: Acme Labs"
                  className="input-field w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>

              {createCustomerError && (
                <p role="alert" className={`text-xs ${styles.pageSubtitle} md:col-span-2`}>
                  {createCustomerError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCreateCustomer}
                disabled={creatingCustomer || !newCustomerName.trim()}
                className="btn-ghost md:col-span-2 w-full rounded-lg py-2 text-sm font-medium disabled:opacity-60"
              >
                {creatingCustomer ? 'Creating…' : 'Create customer & select'}
              </button>
            </div>
          )}

          {createJobError && (
            <p role="alert" className={`mt-2 text-xs ${styles.pageSubtitle}`}>
              {createJobError}
            </p>
          )}

          {!isCreatingNewCustomer && (
            <button
              type="button"
              onClick={handleCreateJob}
              disabled={creatingJob || !newJobTitle.trim() || !newJobCustomerId}
              className="btn-ghost mt-3 w-full rounded-lg py-2 text-sm font-medium disabled:opacity-60"
            >
              {creatingJob ? 'Creating…' : 'Create job & select'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
