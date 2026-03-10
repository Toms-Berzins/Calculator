'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { createQuote } from '@/lib/actions/quotes'
import { QuoteItemsTable } from '@/components/QuoteItemsTable/QuoteItemsTable'
import { formatCurrency } from '@/lib/utils/format'
import styles from './NewQuoteForm.module.css'

interface Job {
  id: string
  title: string
  customers: { name: string; company: string | null } | null
}

interface Props {
  jobs: Job[]
}

export function NewQuoteForm({ jobs }: Props) {
  const [selectedJobId, setSelectedJobId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const { items, taxRate, subtotal, taxAmount, total, addItem, removeItem, updateItem, setTaxRate } =
    useQuoteCalculator()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedJobId) return
    setSubmitting(true)
    try {
      const quoteId = await createQuote(selectedJobId, taxRate, items)
      router.push(`/quotes/${quoteId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          New Quote
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          Select a job and add line items
        </p>
      </div>

      {/* Job selector */}
      <div className="mb-6">
        <label className={`mb-1.5 block text-sm font-medium ${styles.jobLabel}`}>
          Job
        </label>
        <select
          required
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          aria-label="Select a job"
          className="input-field w-full rounded-xl px-3 py-3 text-sm"
        >
          <option value="">Select a job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} — {j.customers?.company ?? j.customers?.name ?? '?'}
            </option>
          ))}
        </select>
      </div>

      {/* Line items */}
      <QuoteItemsTable
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdate={updateItem}
      />

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className={`w-full max-w-xs space-y-2.5 rounded-2xl p-4 ${styles.totalsCard}`}>
          <div className="flex items-center justify-between text-sm">
            <span className={styles.totalRow}>Subtotal</span>
            <span className={`font-medium tabular-nums ${styles.totalAmount}`}>
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="tax" className={styles.totalRow}>
              VAT %
            </label>
            <input
              id="tax"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="input-field w-20 rounded-lg px-2 py-1 text-right text-sm tabular-nums"
            />
          </div>
          {taxRate > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className={styles.totalRow}>VAT</span>
              <span className={`font-medium tabular-nums ${styles.totalAmount}`}>
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
          <div className={`flex items-center justify-between pt-2.5 text-base font-bold ${styles.divider}`}>
            <span className={styles.pageTitle}>Total</span>
            <span className={`tabular-nums ${styles.totalAccent}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !selectedJobId}
        className="btn-primary mt-6 w-full rounded-xl py-4 text-base font-semibold disabled:opacity-60"
      >
        {submitting ? 'Creating…' : 'Create Quote'}
      </button>
    </form>
  )
}
