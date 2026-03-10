'use client'

import { useState, useCallback } from 'react'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { useRealtimeQuote } from '@/hooks/useRealtimeQuote'
import { updateQuoteItems, updateQuoteStatus } from '@/lib/actions/quotes'
import { generateAndStorePDF } from '@/lib/actions/pdf'
import { QuoteItemsTable } from '@/components/QuoteItemsTable/QuoteItemsTable'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { QuoteWithRelations, Quote, QuoteStatus } from '@/types/database'
import styles from './QuoteEditor.module.css'

interface Props {
  quote: QuoteWithRelations
}

export function QuoteEditor({ quote }: Props) {
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(quote.pdf_url ?? '')
  const [pdfError, setPdfError] = useState('')
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
      setPdfError('')
      const url = await generateAndStorePDF(quote.id)
      setPdfUrl(url)
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const customer = quote.jobs?.customers
  const job = quote.jobs

  return (
    <div className={styles.editor}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div>
          <h1 className={styles.title}>{job?.title ?? 'Quote'}</h1>
          <p className={styles.subtitle}>
            {customer?.company ?? customer?.name ?? '—'} · {formatDate(quote.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncIndicator && (
            <span className={styles.syncBadge}>Syncing…</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Line items */}
      <section className={styles.itemsCard}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Line items</h2>
          <span className={styles.sectionMeta}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <QuoteItemsTable
          items={items}
          onAdd={addItem}
          onRemove={removeItem}
          onUpdate={updateItem}
        />
      </section>

      <div className={styles.bottomGrid}>
        {/* Tax & totals */}
        <aside className={styles.totalsCard}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <div className={styles.totalsList}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalValue}>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <label htmlFor="taxRate" className={styles.totalLabel}>
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
                className="input-field w-24 rounded-lg px-2 py-1.5 text-right text-sm tabular-nums"
              />
            </div>
            {taxRate > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>VAT</span>
                <span className={styles.totalValue}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className={styles.totalDivider}>
              <span className={styles.totalAmountLabel}>Total</span>
              <span className={styles.totalAmount}>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>

        {/* Notes + status + PDF */}
        <section className={styles.metaCard}>
          <div>
            <label htmlFor="notes" className={styles.fieldLabel}>Notes</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the customer…"
              aria-label="Additional notes for the customer"
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className={styles.actionRow}>
            <label htmlFor="quoteStatus" className="sr-only">Quote Status</label>
            <select
              id="quoteStatus"
              defaultValue={quote.status}
              onChange={(e) => updateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
              className={`input-field rounded-lg px-3 py-2 text-sm ${styles.statusSelect}`}
            >
              {['draft', 'sent', 'accepted', 'rejected'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <button
              onClick={handleGeneratePDF}
              disabled={generatingPdf}
              className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {generatingPdf ? 'Generating…' : 'Generate PDF'}
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`btn-ghost rounded-lg px-4 py-2 text-sm font-semibold ${styles.downloadLink}`}
              >
                Download PDF
              </a>
            )}
          </div>

          {pdfError && <p className={styles.errorText}>{pdfError}</p>}
        </section>
      </div>
    </div>
  )
}
