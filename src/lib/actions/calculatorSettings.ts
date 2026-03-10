'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_CALCULATOR_SETTINGS,
  type CalculatorSettingsPayload,
  type CalculatorSettingsValues,
} from '@/lib/calculatorSettings'

function isMissingCalculatorSettingsTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  return error.message?.includes("Could not find the table 'public.calculator_settings'") ?? false
}

/** Fires when the DB schema hasn't had the migration applied yet */
function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  // PostgreSQL undefined_column = 42703; PostgREST surfaces it as a 400 with this code
  if (error.code === '42703') return true
  // PostgREST can also emit schema-cache missing-column errors
  if (error.code === 'PGRST204') return true
  const message = error.message?.toLowerCase() ?? ''
  return (
    message.includes('does not exist') ||
    message.includes('could not find') && message.includes('column')
  )
}

const BASE_SELECT =
  `material_price_per_kg, machine_rate_per_hour, labor_rate_per_hour, ` +
  `power_consumption_kw, electricity_rate_per_kwh, failure_rate_percent, margin_percent`

const OVERHEAD_SELECT = `${BASE_SELECT}, material_overhead_percent, updated_at`
const FULL_SELECT = `${BASE_SELECT}, material_overhead_percent, packaging_cost, shipping_cost, updated_at`
const LEGACY_SELECT = `${BASE_SELECT}, updated_at`

function mapSettingsValues(
  data: Partial<CalculatorSettingsValues> & { updated_at?: string },
): CalculatorSettingsValues {
  return {
    material_price_per_kg: data.material_price_per_kg ?? DEFAULT_CALCULATOR_SETTINGS.material_price_per_kg,
    machine_rate_per_hour: data.machine_rate_per_hour ?? DEFAULT_CALCULATOR_SETTINGS.machine_rate_per_hour,
    labor_rate_per_hour: data.labor_rate_per_hour ?? DEFAULT_CALCULATOR_SETTINGS.labor_rate_per_hour,
    power_consumption_kw: data.power_consumption_kw ?? DEFAULT_CALCULATOR_SETTINGS.power_consumption_kw,
    electricity_rate_per_kwh: data.electricity_rate_per_kwh ?? DEFAULT_CALCULATOR_SETTINGS.electricity_rate_per_kwh,
    failure_rate_percent: data.failure_rate_percent ?? DEFAULT_CALCULATOR_SETTINGS.failure_rate_percent,
    margin_percent: data.margin_percent ?? DEFAULT_CALCULATOR_SETTINGS.margin_percent,
    material_overhead_percent: data.material_overhead_percent ?? DEFAULT_CALCULATOR_SETTINGS.material_overhead_percent,
    packaging_cost: data.packaging_cost ?? DEFAULT_CALCULATOR_SETTINGS.packaging_cost,
    shipping_cost: data.shipping_cost ?? DEFAULT_CALCULATOR_SETTINGS.shipping_cost,
  }
}

export async function getCalculatorSettings(): Promise<CalculatorSettingsPayload> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  // Try the newest schema first
  const { data, error } = await supabase
    .from('calculator_settings')
    .select(FULL_SELECT)
    .eq('user_id', user.id)
    .maybeSingle()

  if (isMissingCalculatorSettingsTableError(error)) {
    return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }
  }

  // Column not migrated yet — retry with older schema(s)
  if (isMissingColumnError(error)) {
    // First fallback: schema with material_overhead_percent but without packaging/shipping
    const { data: overheadData, error: overheadError } = await supabase
      .from('calculator_settings')
      .select(OVERHEAD_SELECT)
      .eq('user_id', user.id)
      .maybeSingle()

    if (isMissingCalculatorSettingsTableError(overheadError)) {
      return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }
    }
    if (!overheadError) {
      if (!overheadData) return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }
      return {
        values: mapSettingsValues(overheadData as Partial<CalculatorSettingsValues> & { updated_at?: string }),
        updatedAt: (overheadData as { updated_at?: string }).updated_at ?? null,
      }
    }

    // Second fallback: fully legacy schema without material_overhead_percent
    if (!isMissingColumnError(overheadError)) throw new Error(overheadError.message)

    const { data: legacyData, error: legacyError } = await supabase
      .from('calculator_settings')
      .select(LEGACY_SELECT)
      .eq('user_id', user.id)
      .maybeSingle()

    if (isMissingCalculatorSettingsTableError(legacyError)) {
      return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }
    }
    if (legacyError) throw new Error(legacyError.message)
    if (!legacyData) return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }

    return {
      values: mapSettingsValues(legacyData as Partial<CalculatorSettingsValues> & { updated_at?: string }),
      updatedAt: (legacyData as { updated_at?: string }).updated_at ?? null,
    }
  }

  if (error) throw new Error(error.message)
  if (!data) return { values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null }

  return {
    values: mapSettingsValues(data as Partial<CalculatorSettingsValues> & { updated_at?: string }),
    updatedAt: (data as { updated_at?: string }).updated_at ?? null,
  }
}

export async function saveCalculatorSettings(
  values: CalculatorSettingsValues,
): Promise<CalculatorSettingsPayload> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  // Try the full upsert first
  const { data, error } = await supabase
    .from('calculator_settings')
    .upsert({ user_id: user.id, ...values }, { onConflict: 'user_id' })
    .select(FULL_SELECT)
    .single()

  if (isMissingCalculatorSettingsTableError(error)) {
    throw new Error('Calculator settings table is missing. Run the SQL from supabase/schema.sql in your Supabase project.')
  }

  // Column not migrated yet — retry with older schema(s)
  if (isMissingColumnError(error)) {
    const { packaging_cost: _omitPackaging, shipping_cost: _omitShipping, ...overheadValues } = values
    const { data: overheadData, error: overheadError } = await supabase
      .from('calculator_settings')
      .upsert({ user_id: user.id, ...overheadValues }, { onConflict: 'user_id' })
      .select(OVERHEAD_SELECT)
      .single()

    if (isMissingCalculatorSettingsTableError(overheadError)) {
      throw new Error('Calculator settings table is missing. Run the SQL from supabase/schema.sql in your Supabase project.')
    }

    if (!overheadError && overheadData) {
      revalidatePath('/settings')
      revalidatePath('/quotes/new')
      return {
        values: mapSettingsValues(overheadData as Partial<CalculatorSettingsValues> & { updated_at?: string }),
        updatedAt: (overheadData as { updated_at?: string }).updated_at ?? null,
      }
    }

    if (!isMissingColumnError(overheadError)) {
      throw new Error(overheadError?.message ?? 'Failed to save settings')
    }

    const { material_overhead_percent: _omitOverhead, ...legacyValues } = overheadValues
    const { data: legacyData, error: legacyError } = await supabase
      .from('calculator_settings')
      .upsert({ user_id: user.id, ...legacyValues }, { onConflict: 'user_id' })
      .select(LEGACY_SELECT)
      .single()

    if (isMissingCalculatorSettingsTableError(legacyError)) {
      throw new Error('Calculator settings table is missing. Run the SQL from supabase/schema.sql in your Supabase project.')
    }
    if (legacyError || !legacyData) throw new Error(legacyError?.message ?? 'Failed to save settings')

    revalidatePath('/settings')
    revalidatePath('/quotes/new')
    return {
      values: mapSettingsValues(legacyData as Partial<CalculatorSettingsValues> & { updated_at?: string }),
      updatedAt: (legacyData as { updated_at?: string }).updated_at ?? null,
    }
  }

  if (error || !data) throw new Error(error?.message ?? 'Failed to save settings')

  revalidatePath('/settings')
  revalidatePath('/quotes/new')
  return {
    values: mapSettingsValues(data as Partial<CalculatorSettingsValues> & { updated_at?: string }),
    updatedAt: (data as { updated_at?: string }).updated_at ?? null,
  }
}
