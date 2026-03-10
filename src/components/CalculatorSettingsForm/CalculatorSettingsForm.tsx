'use client'

import { useState } from 'react'
import { saveCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { useT } from '@/i18n/context'
import type { CalculatorSettingsValues } from '@/lib/calculatorSettings'
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

export function CalculatorSettingsForm({ initialValues, initialUpdatedAt }: Props) {
  const [values, setValues] = useState(initialValues)
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const t = useT()

  function setNumber<K extends keyof CalculatorSettingsValues>(key: K, value: number) {
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const updated = await saveCalculatorSettings(values)
      setValues(updated.values)
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
    <form onSubmit={handleSubmit} className={`rounded-2xl p-5 ${styles.card}`}>
      <p className={`mb-3 text-sm ${styles.label}`}>
        {t.settings.lastSaved}{' '}
        <span className={styles.timestampValue}>
          {updatedAt ? formatTimestamp(updatedAt) : t.settings.notSavedYet}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.materialPrice}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.material_price_per_kg}
            onChange={(e) => setNumber('material_price_per_kg', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.machineRate}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.machine_rate_per_hour}
            onChange={(e) => setNumber('machine_rate_per_hour', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.laborRate}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.labor_rate_per_hour}
            onChange={(e) => setNumber('labor_rate_per_hour', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.powerUse}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.power_consumption_kw}
            onChange={(e) => setNumber('power_consumption_kw', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.electricityRate}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.electricity_rate_per_kwh}
            onChange={(e) => setNumber('electricity_rate_per_kwh', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.failureRate}</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={values.failure_rate_percent}
            onChange={(e) => setNumber('failure_rate_percent', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className={`mb-1 block ${styles.label}`}>{t.settings.margin}</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={values.margin_percent}
            onChange={(e) => setNumber('margin_percent', Number(e.target.value))}
            className="input-field w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && <p className={`mt-3 text-sm ${styles.error}`}>{error}</p>}
      {saved && !error && <p className={`mt-3 text-sm ${styles.success}`}>{t.settings.saved}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary mt-4 w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
      >
        {saving ? t.settings.saving : t.settings.saveConstants}
      </button>
    </form>
  )
}
