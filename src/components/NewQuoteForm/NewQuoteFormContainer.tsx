'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator'
import { createQuote } from '@/lib/actions/quotes'
import { QuoteItemsTable } from '@/components/QuoteItemsTable/QuoteItemsTable'
import { formatCurrency } from '@/lib/utils/format'
import { JobConstantsEditor } from './JobConstantsEditor'
import { JobSelectorSection } from './JobSelectorSection'
import { QuoteTotalsCard } from './QuoteTotalsCard'
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
    setEditingConstantValue,
    openConstantEditor,
    closeConstantEditor,
    saveConstant,
    removeConstant,
    undoRemoveConstant,
  } = useJobConstants(calculatorDefaults)

  const { items, taxRate, subtotal, addItem, removeItem, updateItem, setTaxRate } =
    useQuoteCalculator()

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

  function handleJobSelected(jobId: string, title: string) {
    setSelectedJobId(jobId)
    setPartName(title)
  }

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
    const extraItems = items
      .filter((item) => item.tempId !== calculatedItemTempId)
      .map((item, index) => ({ ...item, sort_order: index + 1 }))

    setSubmitting(true)
    try {
      const quoteId = await createQuote(selectedJobId, taxRate, [calculatedItem, ...extraItems])
      router.push(`/quotes/${quoteId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          {t.newQuote.title}
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {t.newQuote.subtitle}
        </p>
      </div>

      <JobSelectorSection
        jobs={jobs}
        customers={customers}
        initialJobId={initialJobId}
        onJobSelected={handleJobSelected}
      />

      <div className={`mb-6 rounded-2xl p-4 ${styles.calculatorCard}`}>
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
            onRemoveConstant: removeConstant,
            onUndoRemoveConstant: undoRemoveConstant,
            onCloseConstantEditor: closeConstantEditor,
            onChangeEditingConstantValue: setEditingConstantValue,
            onSaveConstant: saveConstant,
          }}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.jobPartName}</span>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder={t.newQuote.jobPartNamePlaceholder}
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className={`mb-1 block ${styles.totalRow}`}>{t.newQuote.quantity}</span>
            <input
              type="number"
              min={1}
              step={1}
              value={partQuantity}
              onChange={(e) => setPartQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
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
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
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
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
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
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
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
              className="input-field w-full rounded-lg px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className={`mt-4 rounded-xl p-3 ${styles.calculatorSummary}`}>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className={styles.totalRow}>{t.newQuote.baseCostPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{formatCurrency(pricing.baseCost)}</span>
            <span className={styles.totalRow}>{t.newQuote.riskMarginPerUnit}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{formatCurrency(pricing.riskCost + pricing.marginAmount)}</span>
            <span className={styles.totalRow}>{t.newQuote.difficultyFactor}</span>
            <span className={`text-right tabular-nums ${styles.totalAmount}`}>{jobConstants.difficulty_multiplier_percent}%</span>
            <span className={`pt-1 font-semibold ${styles.pageTitle}`}>{t.newQuote.calculatedUnitPrice}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.totalAccent}`}>{formatCurrency(calculatedUnitPrice)}</span>
            <span className={`pt-1 font-semibold ${styles.pageTitle}`}>{t.newQuote.calculatedLineTotal}</span>
            <span className={`pt-1 text-right font-bold tabular-nums ${styles.totalAccent}`}>{formatCurrency(calculatedLineSubtotal)}</span>
          </div>
          <p className={`mt-2 text-xs ${styles.pageSubtitle}`}>
            {t.newQuote.calculatedLineNote}
          </p>
        </div>
      </div>

      <QuoteItemsTable
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdate={updateItem}
      />

      <div className="mt-6 flex justify-end">
        <QuoteTotalsCard
          quoteSubtotal={quoteSubtotal}
          taxRate={taxRate}
          quoteTaxAmount={quoteTaxAmount}
          quoteTotal={quoteTotal}
          onChangeTaxRate={setTaxRate}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !selectedJobId}
        className="btn-primary mt-6 w-full rounded-xl py-4 text-base font-semibold disabled:opacity-60"
      >
        {submitting ? t.newQuote.creating : t.newQuote.createQuote}
      </button>
    </form>
  )
}
