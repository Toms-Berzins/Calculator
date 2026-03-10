import { NewQuoteForm } from '@/components/NewQuoteForm/NewQuoteForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function NewQuotePage() {
  const supabase = await createServerSupabaseClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, customers ( name, company )')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company')
    .order('name')

  return <NewQuoteForm jobs={jobs ?? []} customers={customers ?? []} />
}
