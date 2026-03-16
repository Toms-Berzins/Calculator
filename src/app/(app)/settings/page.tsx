import { getCalculatorSettings, getCompanyInfo } from '@/lib/actions/calculatorSettings'
import { CalculatorSettingsForm } from '@/components/CalculatorSettingsForm/CalculatorSettingsForm'
import { CompanyInfoForm } from '@/components/CompanyInfoForm/CompanyInfoForm'
import { getDict } from '@/i18n/server'
import styles from './settings.module.css'

export default async function SettingsPage() {
  const [settings, company, t] = await Promise.all([
    getCalculatorSettings(),
    getCompanyInfo(),
    getDict(),
  ])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.settings.title}</h1>
        <p className={styles.pageSubtitle}>
          {t.settings.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <CompanyInfoForm initialCompany={company} />

        <CalculatorSettingsForm
          initialValues={settings.values}
          initialUpdatedAt={settings.updatedAt}
        />
      </div>
    </div>
  )
}
