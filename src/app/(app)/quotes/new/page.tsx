import { NewQuoteForm } from '@/components/NewQuoteForm/NewQuoteForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCalculatorSettings } from '@/lib/actions/calculatorSettings'
import { DEFAULT_CALCULATOR_SETTINGS } from '@/lib/calculatorSettings'

interface NewQuotePageProps {
  searchParams?: Promise<{ jobId?: string }>
}

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  const supabase = await createServerSupabaseClient()
  const resolvedSearchParams = await searchParams
  const initialJobId = resolvedSearchParams?.jobId

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, customers ( name, company )')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company')
    .order('name')

  const calculatorSettings = await getCalculatorSettings().catch(() => ({
    values: DEFAULT_CALCULATOR_SETTINGS,
    updatedAt: null,
  }))

  return (
    <NewQuoteForm
      jobs={jobs ?? []}
      customers={customers ?? []}
      calculatorDefaults={calculatorSettings.values}
      initialJobId={initialJobId}
    />
  )
}
