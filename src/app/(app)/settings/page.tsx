import { getCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { CalculatorSettingsForm } from '@/components/CalculatorSettingsForm/CalculatorSettingsForm'
import styles from './settings.module.css'

export default async function SettingsPage() {
  const settings = await getCalculatorSettings()

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>Settings</h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          Pricing constants used by the 3D print calculator
        </p>
      </div>

      <CalculatorSettingsForm
        initialValues={settings.values}
        initialUpdatedAt={settings.updatedAt}
      />
    </div>
  )
}
