import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuoteEditor } from '@/components/QuoteEditor/QuoteEditor'
import { getCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { DEFAULT_CALCULATOR_SETTINGS } from '@/lib/calculatorSettings'
import { notFound } from 'next/navigation'
import type { QuoteWithRelations } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: quote }, calculatorSettings] = await Promise.all([
    supabase
      .from('quotes')
      .select(`
        *,
        quote_items ( * ),
        jobs ( *, customers ( * ) )
      `)
      .eq('id', id)
      .single(),
    getCalculatorSettings().catch(() => ({ values: DEFAULT_CALCULATOR_SETTINGS, updatedAt: null })),
  ])

  if (!quote) notFound()

  return <QuoteEditor quote={quote as unknown as QuoteWithRelations} calculatorDefaults={calculatorSettings.values} />
}
