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
  | 'material_overhead_percent'
  | 'difficulty_multiplier_percent'

export interface ConstantDefinition {
  key: JobConstantKey
  step: number
  discrete?: boolean
}

export const DIFFICULTY_LEVELS = [
  { value: 100, labelKey: 'easy'   as const, multiplier: '×1.0' },
  { value: 120, labelKey: 'medium' as const, multiplier: '×1.2' },
  { value: 150, labelKey: 'hard'   as const, multiplier: '×1.5' },
] as const

export type DifficultyLabelKey = typeof DIFFICULTY_LEVELS[number]['labelKey']

export interface ConstantChip {
  key: JobConstantKey
  label: string
  value: string
  step: number
  rawValue: number
}

export const CONSTANT_DEFINITIONS: ConstantDefinition[] = [
  { key: 'material_price_per_kg', step: 0.01 },
  { key: 'material_overhead_percent', step: 0.1 },
  { key: 'machine_rate_per_hour', step: 0.01 },
  { key: 'labor_rate_per_hour', step: 0.01 },
  { key: 'power_consumption_kw', step: 0.01 },
  { key: 'electricity_rate_per_kwh', step: 0.01 },
  { key: 'failure_rate_percent', step: 0.1 },
  { key: 'margin_percent', step: 0.1 },
  { key: 'difficulty_multiplier_percent', step: 1, discrete: true },
]
