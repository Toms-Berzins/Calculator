'use server'

import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuoteDocument } from '@/pdf/QuoteDocument'
import type { QuoteWithRelations } from '@/types/database'
import { getLocale } from '@/i18n/server'
import { getCompanyInfo } from '@/lib/actions/calculatorSettings'
import React from 'react'

const DEFAULT_PDF_BUCKET = 'pdfs'

function messageContains(error: { message?: string } | null | undefined, text: string) {
  return error?.message?.toLowerCase().includes(text.toLowerCase()) ?? false
}

function getPdfBucketName() {
  return process.env.SUPABASE_PDF_BUCKET?.trim() || DEFAULT_PDF_BUCKET
}

export async function generateAndStorePDF(quoteId: string): Promise<string> {
  const supabase = await createServerSupabaseClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, quote_items(*), jobs(*, customers(*))')
    .eq('id', quoteId)
    .single()

  if (!quote) throw new Error('Quote not found')

  const locale = await getLocale()
  const company = await getCompanyInfo()

  let buffer: Buffer
  try {
    buffer = await renderToBuffer(
      React.createElement(QuoteDocument, {
        quote: quote as QuoteWithRelations,
        locale,
        company,
      }) as React.ReactElement<DocumentProps>,
    )
  } catch (renderError) {
    console.error('[pdf] renderToBuffer failed:', renderError)
    throw renderError
  }

  const bucketName = getPdfBucketName()
  const fileName = `quotes/${quoteId}.pdf`

  let { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error && messageContains(error, 'bucket not found')) {
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
    })

    if (createBucketError && !messageContains(createBucketError, 'already exists')) {
      throw new Error(
        `Storage bucket "${bucketName}" is missing and could not be created automatically. Create a public bucket named "${bucketName}" in Supabase Storage and retry.`,
      )
    }

    const uploadRetry = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })
    error = uploadRetry.error
  }

  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(fileName)

  await supabase.from('quotes').update({ pdf_url: publicUrl }).eq('id', quoteId)

  return publicUrl
}
