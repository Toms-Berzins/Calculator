'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { BulkDiscountTier } from '@/types/database'

export async function getBulkDiscountTiers(): Promise<BulkDiscountTier[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('bulk_discount_tiers')
    .select('id, min_qty, max_qty, discount_percent, label, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('min_qty', { ascending: true })

  if (error) {
    console.error('getBulkDiscountTiers:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    min_qty: Number(row.min_qty),
    max_qty: row.max_qty != null ? Number(row.max_qty) : null,
    discount_percent: Number(row.discount_percent),
    label: row.label ?? null,
    sort_order: Number(row.sort_order),
    created_at: row.created_at,
  }))
}
