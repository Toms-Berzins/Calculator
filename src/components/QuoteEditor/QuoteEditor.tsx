'use client'

import { useState, useCallback } from 'react'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { useRealtimeQuote } from '@/hooks/useRealtimeQuote'
import { updateQuoteItems, updateQuoteStatus } from '@/lib/actions/quotes'
import { generateAndStorePDF } from '@/lib/actions/pdf'
import { QuoteItemsTable } from '@/components/QuoteItemsTable/QuoteItemsTable'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { QuoteWithRelations, Quote, QuoteStatus } from '@/types/database'

interface Props {
  quote: QuoteWithRelations
}

export function QuoteEditor({ quote }: Props) {
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(quote.pdf_url ?? '')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [syncIndicator, setSyncIndicator] = useState(false)

  const { items, taxRate, subtotal, taxAmount, total, addItem, removeItem, updateItem, setTaxRate } = useQuoteCalculator(
    quote.quote_items.map((i) => ({ ...i, tempId: i.id })),
    quote.tax_rate,
  )

  // Live sync from other employee
  const handleRemoteUpdate = useCallback((updated: Partial<Quote>) => {
    setSyncIndicator(true)
    if (updated.pdf_url) setPdfUrl(updated.pdf_url)
    setTimeout(() => setSyncIndicator(false), 2000)
  }, [])

  useRealtimeQuote(quote.id, handleRemoteUpdate)

  async function handleSave() {
    setSaving(true)
    await updateQuoteItems(quote.id, items, taxRate, notes)
    setSaving(false)
  }

  async function handleGeneratePDF() {
    setGeneratingPdf(true)
    try {
      const url = await generateAndStorePDF(quote.id)
      setPdfUrl(url)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const customer = quote.jobs?.customers
  const job = quote.jobs

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{job?.title ?? 'Quote'}</h1>
          <p className="text-sm text-gray-500">
            {customer?.company ?? customer?.name ?? '—'} · {formatDate(quote.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncIndicator && (
            <span className="text-xs text-blue-500 animate-pulse">Syncing…</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Line items */}
      <QuoteItemsTable
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdate={updateItem}
      />

      {/* Tax & totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="taxRate" className="text-gray-600">
              VAT %
            </label>
            <input
              id="taxRate"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {taxRate > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">VAT</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-blue-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes for the customer…"
          aria-label="Additional notes for the customer"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Status + PDF */}
      <div className="mt-6 flex flex-wrap gap-3">
        <label htmlFor="quoteStatus" className="sr-only">Quote Status</label>
        <select
          id="quoteStatus"
          defaultValue={quote.status}
          onChange={(e) => updateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {['draft', 'sent', 'accepted', 'rejected'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {generatingPdf ? 'Generating…' : 'Generate PDF'}
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Download PDF
          </a>
        )}
      </div>
    </div>
  )
}
