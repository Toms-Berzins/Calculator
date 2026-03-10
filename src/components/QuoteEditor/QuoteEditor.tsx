'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { useRealtimeQuote } from '@/hooks/useRealtimeQuote'
import { updateQuoteItems, updateQuoteStatus } from '@/lib/actions/quotes'
import { generateAndStorePDF } from '@/lib/actions/pdf'
import { QuoteItemsTable } from '@/components/QuoteItemsTable/QuoteItemsTable'
import { JobConstantsEditor } from '@/components/NewQuoteForm/JobConstantsEditor'
import { useJobConstants } from '@/components/NewQuoteForm/useJobConstants'
import { useQuotePricing } from '@/components/NewQuoteForm/useQuotePricing'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { useT } from '@/i18n/context'
import type { QuoteWithRelations, Quote, QuoteStatus } from '@/types/database'
import type { CalculatorSettingsValues } from '@/lib/calculatorSettings'
import styles from './QuoteEditor.module.css'

const CALC_ITEM_ID = 'calc-3d-print'

interface Props {
  quote: QuoteWithRelations
  calculatorDefaults: CalculatorSettingsValues
}

const STATUS_BADGE: Record<string, string> = {
  draft:    'statusDraft',
  sent:     'statusSent',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
}

export function QuoteEditor({ quote, calculatorDefaults }: Props) {
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(quote.pdf_url ?? '')
  const [pdfError, setPdfError] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [syncIndicator, setSyncIndicator] = useState(false)
  const [status, setStatus] = useState<QuoteStatus>((quote.status ?? 'draft') as QuoteStatus)

  // ── Calculator state ──────────────────────────────────────────────────────
  const [partName, setPartName] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [materialWeightGrams, setMaterialWeightGrams] = useState(150)
  const [printTimeHours, setPrintTimeHours] = useState(6)
  const [setupTimeHours, setSetupTimeHours] = useState(0.5)
  const [postProcessingCost, setPostProcessingCost] = useState(2)

  const t = useT()

  const { items, taxRate, subtotal, taxAmount, total, addItem, removeItem, updateItem, setTaxRate, upsertItem } = useQuoteCalculator(
    quote.quote_items.map((i) => ({ ...i, tempId: i.id })),
    quote.tax_rate,
  )

  const handleRemoteUpdate = useCallback((updated: Partial<Quote>) => {
    setSyncIndicator(true)
    if (updated.pdf_url) setPdfUrl(updated.pdf_url)
    setTimeout(() => setSyncIndicator(false), 2000)
  }, [])

  useRealtimeQuote(quote.id, handleRemoteUpdate)

  const {
    jobConstants,
    constantChips,
    canUndoRemove,
    editingConstant,
    editingConstantValue,
    editConstantError,
    setEditingConstantValue,
    openConstantEditor,
    cycleConstant,
    closeConstantEditor,
    saveConstant,
    removeConstant,
    undoRemoveConstant,
  } = useJobConstants(calculatorDefaults)

  const { pricing, calculatedUnitPrice, calculatedDescription, calculatedLineSubtotal } = useQuotePricing({
    partName,
    partQuantity,
    materialWeightGrams,
    printTimeHours,
    setupTimeHours,
    postProcessingCost,
    subtotal,
    taxRate,
    jobConstants,
  })

  function handleAddToQuote() {
    upsertItem({
      tempId: CALC_ITEM_ID,
      description: calculatedDescription,
      quantity: partQuantity,
      unit_price: calculatedUnitPrice,
      sort_order: 0,
    })
  }

  async function handleSave() {
    setSaving(true)
    await updateQuoteItems(quote.id, items, taxRate, notes)
    setSaving(false)
  }

  async function handleGeneratePDF() {
    setGeneratingPdf(true)
    setPdfError('')
    try {
      const url = await generateAndStorePDF(quote.id)
      setPdfUrl(url)
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : t.quote.generating)
    } finally {
      setGeneratingPdf(false)
    }
  }

  function handleStatusChange(next: QuoteStatus) {
    setStatus(next)
    updateQuoteStatus(quote.id, next)
  }

  const customer = quote.jobs?.customers
  const job = quote.jobs
  const badgeClass = styles[STATUS_BADGE[status] as keyof typeof styles]

  return (
    <div className={styles.editor}>

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/quotes" className={styles.breadcrumbLink}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t.quotes.title}
        </Link>
        <span className={styles.breadcrumbSep} aria-hidden>/</span>
        <span className={styles.breadcrumbCurrent}>{job?.title ?? 'Quote'}</span>
      </nav>

      {/* ── Header ── */}
      <div className={styles.headerCard}>
        <div className={styles.headerMeta}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{job?.title ?? 'Quote'}</h1>
            <span className={`${styles.statusBadge} ${badgeClass}`}>
              <span className={styles.statusDot} aria-hidden />
              {t.quote.status[status]}
            </span>
          </div>
          <p className={styles.subtitle}>
            {customer?.company ?? customer?.name ?? '—'}
            <span className={styles.subtitleSep} aria-hidden>·</span>
            {formatDate(quote.created_at)}
          </p>
        </div>

        <div className={styles.headerActions}>
          {syncIndicator && (
            <span className={styles.syncBadge}>
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {t.quote.syncing}
            </span>
          )}

          <div className={styles.statusSelectWrap}>
            <label htmlFor="quoteStatus" className="sr-only">Status</label>
            <select
              id="quoteStatus"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
              className={`input-field rounded-lg px-3 py-2 text-sm ${styles.statusSelect}`}
            >
              {(['draft', 'sent', 'accepted', 'rejected'] as QuoteStatus[]).map((s) => (
                <option key={s} value={s}>{t.quote.status[s]}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60 ${styles.saveBtn}`}
          >
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {t.quote.saving}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.quote.save}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3D Print Calculator ── */}
      <section className={styles.calculatorCard}>
        <JobConstantsEditor
          state={{ constantChips, canUndoRemove, editingConstant, editingConstantValue, editConstantError }}
          actions={{
            onOpenConstantEditor: openConstantEditor,
            onCycleConstant: cycleConstant,
            onRemoveConstant: removeConstant,
            onUndoRemoveConstant: undoRemoveConstant,
            onCloseConstantEditor: closeConstantEditor,
            onChangeEditingConstantValue: setEditingConstantValue,
            onSaveConstant: saveConstant,
          }}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2">
            <span className={styles.inputLabel}>{t.newQuote.jobPartName}</span>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder={t.newQuote.jobPartNamePlaceholder}
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.quantity}</span>
            <input type="number" min={1} step={1} value={partQuantity}
              onChange={(e) => setPartQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.materialWeight}</span>
            <input type="number" min={0} step={1} value={materialWeightGrams}
              onChange={(e) => setMaterialWeightGrams(Number(e.target.value))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.printTime}</span>
            <input type="number" min={0} step={0.1} value={printTimeHours}
              onChange={(e) => setPrintTimeHours(Number(e.target.value))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.setupTime}</span>
            <input type="number" min={0} step={0.1} value={setupTimeHours}
              onChange={(e) => setSetupTimeHours(Number(e.target.value))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-sm md:col-span-2">
            <span className={styles.inputLabel}>{t.newQuote.postProcessing}</span>
            <input type="number" min={0} step={0.01} value={postProcessingCost}
              onChange={(e) => setPostProcessingCost(Number(e.target.value))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>

        <div className={styles.calculatorSummary}>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className={styles.summaryLabel}>{t.newQuote.baseCostPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{formatCurrency(pricing.baseCost)}</span>
            <span className={styles.summaryLabel}>{t.newQuote.riskMarginPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{formatCurrency(pricing.riskCost + pricing.marginAmount)}</span>
            <span className={styles.summaryLabel}>{t.newQuote.difficultyFactor}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{jobConstants.difficulty_multiplier_percent}%</span>
            <span className={`pt-1 font-semibold ${styles.summaryStrong}`}>{t.newQuote.calculatedUnitPrice}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.summaryAccent}`}>{formatCurrency(calculatedUnitPrice)}</span>
            <span className={`pt-1 font-semibold ${styles.summaryStrong}`}>{t.newQuote.calculatedLineTotal}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.summaryAccent}`}>{formatCurrency(calculatedLineSubtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className={styles.summaryNote}>{t.newQuote.calculatedLineNote}</p>
            <button
              type="button"
              onClick={handleAddToQuote}
              className={`btn-primary shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ${styles.addToQuoteBtn}`}
            >
              {t.quote.addToQuote}
            </button>
          </div>
        </div>
      </section>

      {/* ── Line items ── */}
      <section className={styles.itemsCard}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t.quote.lineItems}</h2>
          <span className={styles.sectionMeta}>{t.quote.items(items.length)}</span>
        </div>
        <QuoteItemsTable
          items={items}
          onAdd={addItem}
          onRemove={removeItem}
          onUpdate={updateItem}
        />
      </section>

      {/* ── Bottom grid: notes + totals ── */}
      <div className={styles.bottomGrid}>

        {/* Notes */}
        <section className={styles.notesCard}>
          <h2 className={styles.sectionTitle}>{t.quote.notes}</h2>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.quote.notesPlaceholder}
            aria-label={t.quote.notesPlaceholder}
            className={`input-field mt-2 w-full rounded-xl px-3 py-2.5 text-sm ${styles.notesTextarea}`}
          />
        </section>

        {/* Totals — sticky sidebar on desktop */}
        <aside className={styles.totalsCard}>
          <h2 className={styles.sectionTitle}>{t.quote.summary}</h2>
          <div className={styles.totalsList}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>{t.quote.subtotal}</span>
              <span className={styles.totalValue}>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <label htmlFor="taxRate" className={styles.totalLabel}>{t.quote.vat}</label>
              <input
                id="taxRate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="input-field w-20 rounded-lg px-2 py-1.5 text-right text-sm tabular-nums"
              />
            </div>
            {taxRate > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>{t.quote.vatAmount}</span>
                <span className={styles.totalValue}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
          </div>
          <div className={styles.totalDivider}>
            <span className={styles.totalAmountLabel}>{t.quote.total}</span>
            <span className={styles.totalAmount}>{formatCurrency(total)}</span>
          </div>

          {/* PDF export */}
          <div className={styles.exportSection}>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPdf}
              className={`btn-ghost w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 ${styles.exportBtn}`}
            >
              {generatingPdf ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {t.quote.generating}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  {t.quote.generatePDF}
                </>
              )}
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`btn-ghost w-full rounded-xl py-2.5 text-sm font-semibold ${styles.downloadBtn}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {t.quote.downloadPDF}
              </a>
            )}

            {pdfError && <p className={styles.errorText}>{pdfError}</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}

