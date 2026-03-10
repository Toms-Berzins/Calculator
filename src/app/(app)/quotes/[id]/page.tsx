import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuoteEditor } from '@/components/QuoteEditor/QuoteEditor'
import { notFound } from 'next/navigation'
import type { QuoteWithRelations } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items ( * ),
      jobs ( *, customers ( * ) )
    `)
    .eq('id', id)
    .single()

  if (!quote) notFound()

  return <QuoteEditor quote={quote as unknown as QuoteWithRelations} />
}
