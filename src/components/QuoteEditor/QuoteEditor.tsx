'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { LineItemsTable } from './LineItemsTable'
import { useRealtimeQuote } from '@/hooks/useRealtimeQuote'
import { updateQuoteItems, updateQuoteStatus } from '@/lib/actions/quotes'
import { generateAndStorePDF } from '@/lib/actions/pdf'
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

export function QuoteEditor({ quote, calculatorDefaults }: Props) {
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(quote.pdf_url ?? '')
  const [pdfError, setPdfError] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [syncIndicator, setSyncIndicator] = useState(false)
  const [status, setStatus] = useState<QuoteStatus>((quote.status ?? 'draft') as QuoteStatus)
  const [jobAutoUpdated, setJobAutoUpdated] = useState<'won' | 'lost' | ''>('')

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

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      items: quote.quote_items.map((i) => ({ ...i, tempId: i.id })),
      notes: quote.notes ?? '',
      taxRate: quote.tax_rate,
    })
  )

  const isDirty = useMemo(
    () => JSON.stringify({ items, notes, taxRate }) !== savedSnapshot,
    [items, notes, taxRate, savedSnapshot],
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (!saving) handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving])

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
    difficultyLabel,
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
    let itemsToSave = items
    if (partName.trim()) {
      const calcItem = {
        tempId: CALC_ITEM_ID,
        description: calculatedDescription,
        quantity: partQuantity,
        unit_price: calculatedUnitPrice,
        subtotal: calculatedLineSubtotal,
        sort_order: 0,
      }
      const idx = itemsToSave.findIndex(i => i.tempId === CALC_ITEM_ID)
      itemsToSave = idx === -1
        ? [...itemsToSave, calcItem]
        : itemsToSave.map(i => i.tempId === CALC_ITEM_ID ? calcItem : i)
    }
    await updateQuoteItems(quote.id, itemsToSave, taxRate, notes)
    setSavedSnapshot(JSON.stringify({ items, notes, taxRate }))
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

  async function handleStatusChange(next: QuoteStatus) {
    setStatus(next)
    const result = await updateQuoteStatus(quote.id, next)
    if (result?.jobAutoUpdated) {
      setJobAutoUpdated(result.jobAutoUpdated)
      setTimeout(() => setJobAutoUpdated(''), 8000)
    }
  }

  const customer = quote.jobs?.customers
  const job = quote.jobs

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
            {job && (
              <Link
                href={`/jobs?edit=${job.id}`}
                className={styles.editJobIconBtn}
                aria-label={t.quote.editJob}
                title={t.quote.editJob}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </Link>
            )}
          </div>
          <p className={styles.subtitle}>
            {customer?.company ?? customer?.name ?? '—'}
            <span className={styles.subtitleSep} aria-hidden>·</span>
            {formatDate(quote.created_at)}
          </p>
        </div>

        <div className={styles.headerActions}>
          {isDirty && !saving && (
            <span className={styles.dirtyBadge}>
              {t.quote.unsavedChanges}
            </span>
          )}

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

      {/* ── Job auto-update notification ── */}
      {jobAutoUpdated !== '' && (
        <div
          role="status"
          aria-live="polite"
          className={`${styles.jobUpdateBanner} ${
            jobAutoUpdated === 'won' ? styles.jobUpdateBannerWon : styles.jobUpdateBannerLost
          }`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t.quote.jobAutoUpdated[jobAutoUpdated as 'won' | 'lost']}
        </div>
      )}

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
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.quantity}</span>
            <input type="number" min={1} step={1} value={partQuantity}
              onChange={(e) => setPartQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="input-field w-full px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.materialWeight}</span>
            <input type="number" min={0} step={1} value={materialWeightGrams}
              onChange={(e) => setMaterialWeightGrams(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.printTime}</span>
            <input type="number" min={0} step={0.1} value={printTimeHours}
              onChange={(e) => setPrintTimeHours(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className={styles.inputLabel}>{t.newQuote.setupTime}</span>
            <input type="number" min={0} step={0.1} value={setupTimeHours}
              onChange={(e) => setSetupTimeHours(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm" />
          </label>
          <label className="text-sm md:col-span-2">
            <span className={styles.inputLabel}>{t.newQuote.postProcessing}</span>
            <input type="number" min={0} step={0.01} value={postProcessingCost}
              onChange={(e) => setPostProcessingCost(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm" />
          </label>
        </div>

        <div className={styles.calculatorSummary}>
          <div className="grid grid-cols-2 gap-y-0.5 text-sm">
            <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.materialCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.materialCost)}</span>
            <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.machineCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.machineCost)}</span>
            <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.laborCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.laborCost)}</span>
            <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.energyCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.energyCost)}</span>
            {pricing.postProcessingCost > 0 && (
              <>
                <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.postProcessingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.postProcessingCost)}</span>
              </>
            )}
            {pricing.packagingCost > 0 && (
              <>
                <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.packagingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.packagingCost)}</span>
              </>
            )}
            {pricing.shippingCost > 0 && (
              <>
                <span className={`text-xs ${styles.summaryLabel}`}>{t.newQuote.shippingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.summaryLabel}`}>{formatCurrency(pricing.shippingCost)}</span>
              </>
            )}
            <div className={`col-span-2 my-1.5 border-t ${styles.divider}`} />
            <span className={styles.summaryLabel}>{t.newQuote.baseCostPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{formatCurrency(pricing.baseCost)}</span>
            <span className={styles.summaryLabel}>{t.newQuote.riskPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{formatCurrency(pricing.riskCost)}</span>
            <span className={styles.summaryLabel}>{t.newQuote.marginPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{formatCurrency(pricing.marginAmount)}</span>
            <span className={styles.summaryLabel}>{t.newQuote.difficultyFactor}</span>
            <span className={`text-right tabular-nums ${styles.summaryValue}`}>{difficultyLabel}</span>
            <div className={`col-span-2 my-1.5 border-t ${styles.divider}`} />
            <span className={`pt-1 font-semibold ${styles.summaryStrong}`}>{t.newQuote.calculatedUnitPrice}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.summaryAccent}`}>{formatCurrency(calculatedUnitPrice)}</span>
            <span className={`pt-1 font-semibold ${styles.summaryStrong}`}>{t.newQuote.calculatedLineTotal}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.summaryAccent}`}>{formatCurrency(calculatedLineSubtotal)}</span>
          </div>
          <div className={styles.summaryNoteRow}>
            <button
              type="button"
              onClick={handleAddToQuote}
              className={`btn-primary px-4 py-2 text-sm font-semibold ${styles.addToQuoteBtn}`}
            >
              {t.quote.addToQuote}
            </button>
            <p className={styles.summaryNote}>{t.newQuote.calculatedLineNote}</p>
          </div>
        </div>
      </section>

      {/* ── Line items ── */}
      <LineItemsTable
        items={items}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
      />

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

