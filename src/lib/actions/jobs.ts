'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createJob(data: {
  title: string
  description: string
  customerId: string
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      title: data.title,
      description: data.description,
      customer_id: data.customerId,
      status: 'open',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/jobs')
  return job
}

export async function createCustomer(data: {
  name: string
  company: string
  email: string
  phone: string
}) {
  const supabase = await createServerSupabaseClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/customers')
  return customer
}
