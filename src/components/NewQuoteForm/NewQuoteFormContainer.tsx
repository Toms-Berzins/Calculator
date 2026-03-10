'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { createQuote } from '@/lib/actions/quotes'
import { formatCurrency } from '@/lib/utils/format'
import { JobConstantsEditor } from './JobConstantsEditor'
import { JobSelectorSection } from './JobSelectorSection'
import {
  type NewQuoteFormProps,
} from './NewQuoteForm.types'
import { useJobConstants } from './useJobConstants'
import { useQuotePricing } from './useQuotePricing'
import { useT } from '@/i18n/context'
import styles from './NewQuoteForm.module.css'

export function NewQuoteForm({ jobs, customers, calculatorDefaults, initialJobId }: NewQuoteFormProps) {
  const t = useT()
  const calculatedItemTempId = 'calculated-3d-print-item'
  const [selectedJobId, setSelectedJobId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [partName, setPartName] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [materialWeightGrams, setMaterialWeightGrams] = useState(150)
  const [printTimeHours, setPrintTimeHours] = useState(6)
  const [setupTimeHours, setSetupTimeHours] = useState(0.5)
  const [postProcessingCost, setPostProcessingCost] = useState(2)
  const router = useRouter()

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

  const { taxRate, subtotal, setTaxRate } = useQuoteCalculator()

  const {
    pricing,
    calculatedUnitPrice,
    calculatedDescription,
    calculatedLineSubtotal,
    quoteSubtotal,
    quoteTaxAmount,
    quoteTotal,
  } = useQuotePricing({
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

  const handleJobSelected = useCallback((jobId: string, title: string) => {
    setSelectedJobId(jobId)
    setPartName(title)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedJobId) return

    const calculatedItem = {
      tempId: calculatedItemTempId,
      description: calculatedDescription,
      quantity: partQuantity,
      unit_price: calculatedUnitPrice,
      subtotal: calculatedLineSubtotal,
      sort_order: 0,
    }
    setSubmitting(true)
    try {
      const quoteId = await createQuote(selectedJobId, taxRate, [calculatedItem])
      router.push(`/quotes/${quoteId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t.newQuote.title}
        </h1>
        <p className={styles.pageSubtitle}>
          {t.newQuote.subtitle}
        </p>
      </div>

      <JobSelectorSection
        jobs={jobs}
        customers={customers}
        initialJobId={initialJobId}
        onJobSelected={handleJobSelected}
      />

      <div className={`mb-6 p-4 ${styles.calculatorCard}`}>
        <JobConstantsEditor
          state={{
            constantChips,
            canUndoRemove,
            editingConstant,
            editingConstantValue,
            editConstantError,
          }}
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
          {selectedJobId && (
            <label className="text-sm md:col-span-2">
              <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.jobPartName}</span>
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder={t.newQuote.jobPartNamePlaceholder}
                className="input-field w-full px-3 py-2 text-sm"
              />
            </label>
          )}
          <label className="text-sm">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.quantity}</span>
            <input
              type="number"
              min={1}
              step={1}
              value={partQuantity}
              onChange={(e) => setPartQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.materialWeight}</span>
            <input
              type="number"
              min={0}
              step={1}
              value={materialWeightGrams}
              onChange={(e) => setMaterialWeightGrams(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.printTime}</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={printTimeHours}
              onChange={(e) => setPrintTimeHours(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.setupTime}</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={setupTimeHours}
              onChange={(e) => setSetupTimeHours(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.postProcessing}</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={postProcessingCost}
              onChange={(e) => setPostProcessingCost(Number(e.target.value))}
              className="input-field w-full px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className={`mt-4 p-3 ${styles.calculatorSummary}`}>
          <div className="grid grid-cols-2 gap-y-0.5 text-sm">
            <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.materialCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.materialCost)}</span>
            <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.machineCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.machineCost)}</span>
            <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.laborCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.laborCost)}</span>
            <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.energyCostRow}</span>
            <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.energyCost)}</span>
            {pricing.postProcessingCost > 0 && (
              <>
                <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.postProcessingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.postProcessingCost)}</span>
              </>
            )}
            {pricing.packagingCost > 0 && (
              <>
                <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.packagingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.packagingCost)}</span>
              </>
            )}
            {pricing.shippingCost > 0 && (
              <>
                <span className={`text-xs ${styles.pageSubtitle}`}>{t.newQuote.shippingLabel}</span>
                <span className={`text-right text-xs tabular-nums ${styles.pageSubtitle}`}>{formatCurrency(pricing.shippingCost)}</span>
              </>
            )}
            <div className={`col-span-2 my-1.5 border-t ${styles.divider}`} />
            <span className={styles.totalRow}>{t.newQuote.baseCostPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{formatCurrency(pricing.baseCost)}</span>
            <span className={styles.totalRow}>{t.newQuote.riskPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{formatCurrency(pricing.riskCost)}</span>
            <span className={styles.totalRow}>{t.newQuote.marginPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{formatCurrency(pricing.marginAmount)}</span>
            <span className={styles.totalRow}>{t.newQuote.difficultyFactor}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{difficultyLabel}</span>

            <div className={`col-span-2 my-2 border-t ${styles.divider}`} />

            <span className={styles.totalRow}>{t.quote.subtotal}</span>
            <span className={`text-right font-medium tabular-nums ${styles.totalAmount}`}>
              {formatCurrency(quoteSubtotal)}
            </span>

            <label htmlFor="tax" className={styles.totalRow}>
              {t.quote.vat}
            </label>
            <div className="text-right">
              <input
                id="tax"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="input-field w-20 px-2 py-1 text-right text-sm tabular-nums"
              />
            </div>

            {taxRate > 0 && (
              <>
                <span className={styles.totalRow}>{t.quote.vatAmount}</span>
                <span className={`text-right font-medium tabular-nums ${styles.totalAmount}`}>
                  {formatCurrency(quoteTaxAmount)}
                </span>
              </>
            )}

            <div className={`col-span-2 mt-2 pt-2.5 border-t flex items-center justify-between text-base font-bold ${styles.divider}`}>
              <span className={styles.pageTitle}>{t.quote.total}</span>
              <span className={`tabular-nums ${styles.totalAccent}`}>
                {formatCurrency(quoteTotal)}
              </span>
            </div>
          </div>
          <p className={`mt-2 text-xs ${styles.pageSubtitle}`}>
            {t.newQuote.calculatedLineNote}
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !selectedJobId}
        className="btn-primary mt-6 w-full py-4 text-base font-semibold disabled:opacity-60"
      >
        {submitting ? t.newQuote.creating : t.newQuote.createQuote}
      </button>
    </form>
  )
}
