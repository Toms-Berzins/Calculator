import type { CalculatorSettingsValues } from '@/lib/calculatorSettings'

export interface Job {
  id: string
  title: string
  customers: { name: string; company: string | null } | null
}

export interface Customer {
  id: string
  name: string
  company: string | null
}

export interface CreatedJob {
  id: string
  title: string
}

export interface CreatedCustomer {
  id: string
  name: string
  company: string | null
}

export interface NewQuoteFormProps {
  jobs: Job[]
  customers: Customer[]
  calculatorDefaults: CalculatorSettingsValues
  initialJobId?: string
}

export const CREATE_NEW_JOB_VALUE = '__create_new_job__'
export const CREATE_NEW_CUSTOMER_VALUE = '__create_new_customer__'

export type JobConstantKey =
  | 'material_price_per_kg'
  | 'machine_rate_per_hour'
  | 'labor_rate_per_hour'
  | 'power_consumption_kw'
  | 'electricity_rate_per_kwh'
  | 'failure_rate_percent'
  | 'margin_percent'
  | 'difficulty_multiplier_percent'

export interface ConstantDefinition {
  key: JobConstantKey
  label: string
  step: number
}

export interface ConstantChip {
  key: JobConstantKey
  label: string
  value: string
  step: number
  rawValue: number
}

export const CONSTANT_DEFINITIONS: ConstantDefinition[] = [
  { key: 'material_price_per_kg', label: 'Material/kg', step: 0.01 },
  { key: 'machine_rate_per_hour', label: 'Machine/h', step: 0.01 },
  { key: 'labor_rate_per_hour', label: 'Labor/h', step: 0.01 },
  { key: 'power_consumption_kw', label: 'Power', step: 0.01 },
  { key: 'electricity_rate_per_kwh', label: 'Electricity', step: 0.01 },
  { key: 'failure_rate_percent', label: 'Failure', step: 0.1 },
  { key: 'margin_percent', label: 'Margin', step: 0.1 },
  { key: 'difficulty_multiplier_percent', label: 'Difficulty', step: 1 },
]
