'use server'

import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuoteDocument } from '@/pdf/QuoteDocument'
import type { QuoteWithRelations } from '@/types/database'
import React from 'react'

export async function generateAndStorePDF(quoteId: string): Promise<string> {
  const supabase = await createServerSupabaseClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, quote_items(*), jobs(*, customers(*))')
    .eq('id', quoteId)
    .single()

  if (!quote) throw new Error('Quote not found')

  const buffer = await renderToBuffer(
    React.createElement(QuoteDocument, {
      quote: quote as QuoteWithRelations,
    }) as React.ReactElement<DocumentProps>,
  )

  const fileName = `quotes/${quoteId}.pdf`

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from('pdfs').getPublicUrl(fileName)

  await supabase.from('quotes').update({ pdf_url: publicUrl }).eq('id', quoteId)

  return publicUrl
}
