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

function mapSettingsValues(data: CalculatorSettingsValues): CalculatorSettingsValues {
  return {
    material_price_per_kg: data.material_price_per_kg,
    machine_rate_per_hour: data.machine_rate_per_hour,
    labor_rate_per_hour: data.labor_rate_per_hour,
    power_consumption_kw: data.power_consumption_kw,
    electricity_rate_per_kwh: data.electricity_rate_per_kwh,
    failure_rate_percent: data.failure_rate_percent,
    margin_percent: data.margin_percent,
  }
}

export async function getCalculatorSettings(): Promise<CalculatorSettingsPayload> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { data, error } = await supabase
    .from('calculator_settings')
    .select(
      `material_price_per_kg, machine_rate_per_hour, labor_rate_per_hour, power_consumption_kw, electricity_rate_per_kwh, failure_rate_percent, margin_percent, updated_at`,
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (isMissingCalculatorSettingsTableError(error)) {
    return {
      values: DEFAULT_CALCULATOR_SETTINGS,
      updatedAt: null,
    }
  }

  if (error) throw new Error(error.message)
  if (!data) {
    return {
      values: DEFAULT_CALCULATOR_SETTINGS,
      updatedAt: null,
    }
  }

  return {
    values: mapSettingsValues(data),
    updatedAt: data.updated_at,
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

  const { data, error } = await supabase
    .from('calculator_settings')
    .upsert(
      {
        user_id: user.id,
        ...values,
      },
      { onConflict: 'user_id' },
    )
    .select(
      `material_price_per_kg, machine_rate_per_hour, labor_rate_per_hour, power_consumption_kw, electricity_rate_per_kwh, failure_rate_percent, margin_percent, updated_at`,
    )
    .single()

  if (isMissingCalculatorSettingsTableError(error)) {
    throw new Error("Calculator settings table is missing. Run the SQL from supabase/schema.sql in your Supabase project.")
  }

  if (error || !data) throw new Error(error?.message ?? 'Failed to save settings')

  revalidatePath('/settings')
  revalidatePath('/quotes/new')

  return {
    values: mapSettingsValues(data),
    updatedAt: data.updated_at,
  }
}
