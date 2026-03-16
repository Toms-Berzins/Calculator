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
  revalidatePath('/quotes')
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const supabase = await createServerSupabaseClient()

  // Fetch the quote so we know which job to update
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, job_id')
    .eq('id', quoteId)
    .single()

  if (quoteError || !quote) throw new Error(quoteError?.message ?? 'Quote not found')

  await supabase.from('quotes').update({ status }).eq('id', quoteId)

  let jobAutoUpdated: 'won' | 'lost' | undefined

  if (status === 'accepted') {
    // Quote accepted → mark the parent job as won
    await supabase.from('jobs').update({ status: 'won' }).eq('id', quote.job_id)
    jobAutoUpdated = 'won'
    revalidatePath('/jobs')
  } else if (status === 'rejected') {
    // Check whether every remaining quote for this job is also rejected
    const { count } = await supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', quote.job_id)
      .neq('status', 'rejected')

    if ((count ?? 0) === 0) {
      // All quotes are rejected → mark the job as lost
      await supabase.from('jobs').update({ status: 'lost' }).eq('id', quote.job_id)
      jobAutoUpdated = 'lost'
      revalidatePath('/jobs')
    }
  }

  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/quotes')
  return { jobAutoUpdated }
}

export async function deleteDraftQuote(quoteId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { data: quote, error: findError } = await supabase
    .from('quotes')
    .select('id, status')
    .eq('id', quoteId)
    .single()

  if (findError || !quote) {
    throw new Error(findError?.message ?? 'Quote not found')
  }

  if (quote.status !== 'draft') {
    throw new Error('Only draft quotes can be deleted')
  }

  const { error: deleteError } = await supabase.from('quotes').delete().eq('id', quoteId)

  if (deleteError) throw new Error(deleteError.message)

  revalidatePath('/quotes')
}
