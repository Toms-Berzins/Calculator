'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { LineItem } from '@/hooks/useQuoteCalculator'
import type { QuoteStatus } from '@/types/database'

export async function createQuote(jobId: string, taxRate: number, items: LineItem[]) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal * (1 + taxRate / 100)

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      job_id: jobId,
      created_by: user.id,
      status: 'draft',
      subtotal,
      tax_rate: taxRate,
      total,
      notes: null,
      pdf_url: null,
    })
    .select('id')
    .single()

  if (error || !quote) throw new Error(error?.message ?? 'Failed to create quote')

  if (items.length > 0) {
    await supabase.from('quote_items').insert(
      items.map((item, i) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        sort_order: i,
      })),
    )
  }

  revalidatePath('/quotes')
  return quote.id
}

export async function updateQuoteItems(
  quoteId: string,
  items: LineItem[],
  taxRate: number,
  notes: string,
) {
  const supabase = await createServerSupabaseClient()

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal * (1 + taxRate / 100)

  // Replace all items atomically
  await supabase.from('quote_items').delete().eq('quote_id', quoteId)

  if (items.length > 0) {
    await supabase.from('quote_items').insert(
      items.map((item, i) => ({
        quote_id: quoteId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        sort_order: i,
      })),
    )
  }

  await supabase
    .from('quotes')
    .update({ subtotal, tax_rate: taxRate, total, notes, updated_at: new Date().toISOString() })
    .eq('id', quoteId)

  revalidatePath(`/quotes/${quoteId}`)
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const supabase = await createServerSupabaseClient()
  await supabase.from('quotes').update({ status }).eq('id', quoteId)
  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/quotes')
}
