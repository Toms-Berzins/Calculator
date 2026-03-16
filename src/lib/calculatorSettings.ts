export interface CalculatorSettingsValues {
  material_price_per_kg: number
  machine_rate_per_hour: number
  labor_rate_per_hour: number
  power_consumption_kw: number
  electricity_rate_per_kwh: number
  failure_rate_percent: number
  margin_percent: number
  /** Extra % added to raw filament weight cost for supports, brims, purge lines & waste */
  material_overhead_percent: number
  packaging_cost: number
  shipping_cost: number
}

export interface CompanyInfo {
  company_name: string | null
  company_address: string | null
  company_vat_number: string | null
  company_email: string | null
  company_phone: string | null
  company_website: string | null
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: null,
  company_address: null,
  company_vat_number: null,
  company_email: null,
  company_phone: null,
  company_website: null,
}

export interface CalculatorSettingsPayload {
  values: CalculatorSettingsValues
  updatedAt: string | null
}

export const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettingsValues = {
  material_price_per_kg: 24,
  machine_rate_per_hour: 6,
  labor_rate_per_hour: 20,
  power_consumption_kw: 0.22,
  electricity_rate_per_kwh: 0.18,
  failure_rate_percent: 12,
  margin_percent: 35,
  material_overhead_percent: 10,
  packaging_cost: 0,
  shipping_cost: 0,
}
