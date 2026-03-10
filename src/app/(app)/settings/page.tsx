import { getCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { CalculatorSettingsForm } from '@/components/CalculatorSettingsForm/CalculatorSettingsForm'
import { getDict } from '@/i18n/server'
import styles from './settings.module.css'

export default async function SettingsPage() {
  const [settings, t] = await Promise.all([getCalculatorSettings(), getDict()])

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>{t.settings.title}</h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {t.settings.subtitle}
        </p>
      </div>

      <CalculatorSettingsForm
        initialValues={settings.values}
        initialUpdatedAt={settings.updatedAt}
      />
    </div>
  )
}
