'use client'

import { useState } from 'react'
import { saveCompanyInfo } from '@/lib/actions/calculatorSettings'
import { useT } from '@/i18n/context'
import type { CompanyInfo } from '@/lib/calculatorSettings'
import styles from '@/components/CalculatorSettingsForm/CalculatorSettingsForm.module.css'

interface Props {
  initialCompany: CompanyInfo
}

export function CompanyInfoForm({ initialCompany }: Props) {
  const [values, setValues] = useState(initialCompany)
  const [savedValues, setSavedValues] = useState(initialCompany)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const t = useT()

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues)

  function setField(key: keyof CompanyInfo, value: string) {
    setValues((prev) => ({ ...prev, [key]: value || null }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      await saveCompanyInfo(values)
      setSavedValues(values)
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.settings.failedToSaveCompany)
    } finally {
      setSaving(false)
    }
  }

  const fields: [keyof CompanyInfo, string, string][] = [
    ['company_name',       t.settings.companyName,       t.settings.companyNamePlaceholder],
    ['company_address',    t.settings.companyAddress,    t.settings.companyAddressPlaceholder],
    ['company_vat_number', t.settings.companyVatNumber,  t.settings.companyVatNumberPlaceholder],
    ['company_email',      t.settings.companyEmail,      t.settings.companyEmailPlaceholder],
    ['company_phone',      t.settings.companyPhone,      t.settings.companyPhonePlaceholder],
    ['company_website',    t.settings.companyWebsite,    t.settings.companyWebsitePlaceholder],
  ]

  return (
    <form onSubmit={handleSubmit} className={`p-5 ${styles.card}`}>
      <div className={styles.formHeader}>
        <p className={`text-sm ${styles.label}`}>{t.settings.companyHint}</p>
        {isDirty && !saved && (
          <span className={styles.unsavedBadge}>{t.settings.unsavedChanges}</span>
        )}
      </div>

      <div className={`${styles.section} ${styles.sectionLast}`}>
        <h3 className={styles.sectionTitle}>{t.settings.sectionCompany}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="text-sm">
              <span className={`mb-1 block ${styles.fieldLabel}`}>{label}</span>
              <input
                type="text"
                value={values[key] ?? ''}
                placeholder={placeholder}
                onChange={(e) => setField(key, e.target.value)}
                className="input-field w-full px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </div>

      {error && <p className={`mt-3 text-sm ${styles.error}`}>{error}</p>}
      {saved && !error && <p className={`mt-3 text-sm ${styles.success}`}>{t.settings.savedCompany}</p>}

      <div className={styles.formActions}>
        <button
          type="submit"
          disabled={saving}
          className={`btn-primary flex-1 py-3 disabled:opacity-60 ${isDirty ? styles.dirtyButton : ''}`}
        >
          {saving ? t.settings.savingCompany : t.settings.saveCompany}
        </button>
      </div>
    </form>
  )
}
