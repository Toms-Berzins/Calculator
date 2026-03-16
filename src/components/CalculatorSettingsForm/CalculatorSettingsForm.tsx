'use client'

import { useState } from 'react'
import { saveCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { useT } from '@/i18n/context'
import {
  DEFAULT_CALCULATOR_SETTINGS,
  type CalculatorSettingsValues,
} from '@/lib/calculatorSettings'
import styles from './CalculatorSettingsForm.module.css'

interface Props {
  initialValues: CalculatorSettingsValues
  initialUpdatedAt: string | null
}

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

interface NumberFieldProps {
  label: string
  hint: string
  value: number
  step: number
  suffix?: string
  onChange: (n: number) => void
}

function NumberField({ label, hint, value, step, suffix, onChange }: NumberFieldProps) {
  const safeValue = Number.isFinite(value) ? value : 0

  return (
    <label className="text-sm">
      <span className={`mb-1 block ${styles.fieldLabel}`}>{label}</span>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          min={0}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`input-field w-full px-3 py-2 text-sm ${suffix ? styles.inputWithSuffix : ''}`}
        />
        {suffix && <span className={styles.inputSuffix}>{suffix}</span>}
      </div>
      <span className={styles.fieldHint}>{hint}</span>
    </label>
  )
}

function normalizeSettingsValues(values: CalculatorSettingsValues): CalculatorSettingsValues {
  return {
    material_price_per_kg: values.material_price_per_kg ?? DEFAULT_CALCULATOR_SETTINGS.material_price_per_kg,
    machine_rate_per_hour: values.machine_rate_per_hour ?? DEFAULT_CALCULATOR_SETTINGS.machine_rate_per_hour,
    labor_rate_per_hour: values.labor_rate_per_hour ?? DEFAULT_CALCULATOR_SETTINGS.labor_rate_per_hour,
    power_consumption_kw: values.power_consumption_kw ?? DEFAULT_CALCULATOR_SETTINGS.power_consumption_kw,
    electricity_rate_per_kwh: values.electricity_rate_per_kwh ?? DEFAULT_CALCULATOR_SETTINGS.electricity_rate_per_kwh,
    failure_rate_percent: values.failure_rate_percent ?? DEFAULT_CALCULATOR_SETTINGS.failure_rate_percent,
    margin_percent: values.margin_percent ?? DEFAULT_CALCULATOR_SETTINGS.margin_percent,
    material_overhead_percent: values.material_overhead_percent ?? DEFAULT_CALCULATOR_SETTINGS.material_overhead_percent,
    packaging_cost: values.packaging_cost ?? DEFAULT_CALCULATOR_SETTINGS.packaging_cost,
    shipping_cost: values.shipping_cost ?? DEFAULT_CALCULATOR_SETTINGS.shipping_cost,
  }
}

export function CalculatorSettingsForm({ initialValues, initialUpdatedAt }: Props) {
  const [values, setValues] = useState(() => normalizeSettingsValues(initialValues))
  const [savedValues, setSavedValues] = useState(() => normalizeSettingsValues(initialValues))
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  // Depreciation quick-calc state
  const [showDeprHelper, setShowDeprHelper] = useState(false)
  const [deprPrinterCost, setDeprPrinterCost] = useState(800)
  const [deprLifetimeHours, setDeprLifetimeHours] = useState(5000)
  const t = useT()

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues)

  const deprSuggestedRate =
    deprLifetimeHours > 0
      ? Math.round((deprPrinterCost / deprLifetimeHours) * 100) / 100
      : 0

  function setNumber<K extends keyof CalculatorSettingsValues>(key: K, value: number) {
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 }))
    setSaved(false)
  }

  function handleReset() {
    setValues(DEFAULT_CALCULATOR_SETTINGS)
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const updated = await saveCalculatorSettings(values)
      const normalizedValues = normalizeSettingsValues(updated.values)
      setValues(normalizedValues)
      setSavedValues(normalizedValues)
      setUpdatedAt(updated.updatedAt)
      setSaved(true)
    } catch (caught) {
      if (caught instanceof Error && caught.message) {
        setError(caught.message)
      } else {
        setError(t.settings.failedToSave)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`p-5 ${styles.card}`}>
      {/* Header row */}
      <div className={styles.formHeader}>
        <p className={`text-sm ${styles.label}`}>
          {t.settings.lastSaved}{' '}
          <span className={styles.timestampValue}>
            {updatedAt ? formatTimestamp(updatedAt) : t.settings.notSavedYet}
          </span>
        </p>
        {isDirty && !saved && (
          <span className={styles.unsavedBadge}>{t.settings.unsavedChanges}</span>
        )}
      </div>

      {/* ── Section: Materials ─────────────────────────────────── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.settings.sectionMaterials}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberField
            label={t.settings.materialPrice}
            hint={t.settings.materialPriceHint}
            value={values.material_price_per_kg}
            step={0.01}
            suffix="€/kg"
            onChange={(v) => setNumber('material_price_per_kg', v)}
          />
          <NumberField
            label={t.settings.materialOverhead}
            hint={t.settings.materialOverheadHint}
            value={values.material_overhead_percent}
            step={0.5}
            suffix="%"
            onChange={(v) => setNumber('material_overhead_percent', v)}
          />
        </div>
      </div>

      {/* ── Section: Machine & Energy ──────────────────────────── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.settings.sectionMachineEnergy}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Machine rate + depreciation helper */}
          <div className="flex flex-col gap-1">
            <NumberField
              label={t.settings.machineRate}
              hint={t.settings.machineRateHint}
              value={values.machine_rate_per_hour}
              step={0.01}
              suffix="€/h"
              onChange={(v) => setNumber('machine_rate_per_hour', v)}
            />
            <button
              type="button"
              className={styles.deprToggle}
              onClick={() => setShowDeprHelper((p) => !p)}
            >
              <span>{showDeprHelper ? '▲' : '▼'}</span>
              {t.settings.deprHelperTitle}
            </button>
            {showDeprHelper && (
              <div className={styles.deprHelper}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs">
                    <span className={`mb-1 block ${styles.label}`}>
                      {t.settings.deprPrinterCost}
                    </span>
                    <div className={styles.inputWrapper}>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={deprPrinterCost}
                        onChange={(e) =>
                          setDeprPrinterCost(Math.max(0, Number(e.target.value)))
                        }
                        className={`input-field w-full px-3 py-1.5 text-xs ${styles.inputWithSuffix}`}
                      />
                      <span className={styles.inputSuffix}>€</span>
                    </div>
                  </label>
                  <label className="text-xs">
                    <span className={`mb-1 block ${styles.label}`}>
                      {t.settings.deprLifetimeHours}
                    </span>
                    <div className={styles.inputWrapper}>
                      <input
                        type="number"
                        min={1}
                        step={100}
                        value={deprLifetimeHours}
                        onChange={(e) =>
                          setDeprLifetimeHours(Math.max(1, Number(e.target.value)))
                        }
                        className={`input-field w-full px-3 py-1.5 text-xs ${styles.inputWithSuffix}`}
                      />
                      <span className={styles.inputSuffix}>h</span>
                    </div>
                  </label>
                </div>
                <div className={styles.deprResult}>
                  <span className={styles.deprResultText}>
                    {t.settings.deprResult(deprSuggestedRate)}
                  </span>
                  <button
                    type="button"
                    className="btn-primary px-3 py-2"
                    onClick={() => {
                      setNumber('machine_rate_per_hour', deprSuggestedRate)
                      setShowDeprHelper(false)
                    }}
                  >
                    {t.settings.deprApply}
                  </button>
                </div>
              </div>
            )}
          </div>

          <NumberField
            label={t.settings.powerUse}
            hint={t.settings.powerUseHint}
            value={values.power_consumption_kw}
            step={0.01}
            suffix="kW"
            onChange={(v) => setNumber('power_consumption_kw', v)}
          />
          <NumberField
            label={t.settings.electricityRate}
            hint={t.settings.electricityRateHint}
            value={values.electricity_rate_per_kwh}
            step={0.000001}
            suffix="€/kWh"
            onChange={(v) => setNumber('electricity_rate_per_kwh', v)}
          />
        </div>
      </div>

      {/* ── Section: Labor ─────────────────────────────────────── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.settings.sectionLabor}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberField
            label={t.settings.laborRate}
            hint={t.settings.laborRateHint}
            value={values.labor_rate_per_hour}
            step={0.01}
            suffix="€/h"
            onChange={(v) => setNumber('labor_rate_per_hour', v)}
          />
        </div>
      </div>

      {/* ── Section: Pricing ───────────────────────────────────── */}
      <div className={`${styles.section} ${styles.sectionLast}`}>
        <h3 className={styles.sectionTitle}>{t.settings.sectionPricing}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberField
            label={t.settings.failureRate}
            hint={t.settings.failureRateHint}
            value={values.failure_rate_percent}
            step={0.1}
            suffix="%"
            onChange={(v) => setNumber('failure_rate_percent', v)}
          />
          <NumberField
            label={t.settings.margin}
            hint={t.settings.marginHint}
            value={values.margin_percent}
            step={0.1}
            suffix="%"
            onChange={(v) => setNumber('margin_percent', v)}
          />
          <NumberField
            label={t.settings.packagingCost}
            hint={t.settings.packagingCostHint}
            value={values.packaging_cost}
            step={0.01}
            suffix="€"
            onChange={(v) => setNumber('packaging_cost', v)}
          />
          <NumberField
            label={t.settings.shippingCost}
            hint={t.settings.shippingCostHint}
            value={values.shipping_cost}
            step={0.01}
            suffix="€"
            onChange={(v) => setNumber('shipping_cost', v)}
          />
        </div>
      </div>

      {error && <p className={`mt-3 text-sm ${styles.error}`}>{error}</p>}
      {saved && !error && <p className={`mt-3 text-sm ${styles.success}`}>{t.settings.saved}</p>}

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={handleReset}
          className={`px-4 py-3 ${styles.resetButton}`}
        >
          {t.settings.resetToDefaults}
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`btn-primary flex-1 py-3 disabled:opacity-60 ${isDirty ? styles.dirtyButton : ''}`}
        >
          {saving ? t.settings.saving : t.settings.saveConstants}
        </button>
      </div>
    </form>
  )
}
