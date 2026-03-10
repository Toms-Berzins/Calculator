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
}
