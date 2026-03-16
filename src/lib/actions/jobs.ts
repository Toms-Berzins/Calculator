'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function toNullable(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function verifyCurrentUserPassword(password: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')
  if (!user.email) throw new Error('Account email is required for password confirmation')
  if (!password.trim()) throw new Error('Password is required')

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (verifyError) throw new Error('Invalid password')
  return supabase
}

async function ensureJobHasNoQuotes(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  jobId: string,
) {
  const { count, error } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId)

  if (error) throw new Error(error.message)
  if ((count ?? 0) > 0) throw new Error('Cannot delete a job that has quotes')
}

async function ensureCustomerHasNoJobs(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  customerId: string,
) {
  const { count, error } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId)

  if (error) throw new Error(error.message)
  if ((count ?? 0) > 0) throw new Error('Cannot delete a customer that has jobs')
}

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

export async function updateJob(data: {
  id: string
  title: string
  description: string
  status: 'open' | 'won' | 'lost' | 'archived'
  customerId: string
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const title = data.title.trim()
  if (!title) throw new Error('Job title is required')
  if (!data.customerId) throw new Error('Customer is required')

  const { data: job, error } = await supabase
    .from('jobs')
    .update({
      title,
      description: toNullable(data.description),
      status: data.status,
      customer_id: data.customerId,
    })
    .eq('id', data.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/jobs')
  revalidatePath('/quotes/new')
  return job
}

export async function deleteJob(jobId: string, password: string) {
  const supabase = await verifyCurrentUserPassword(password)
  await ensureJobHasNoQuotes(supabase, jobId)

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) throw new Error(error.message)

  revalidatePath('/jobs')
  revalidatePath('/quotes/new')
}

export async function createCustomer(data: {
  name: string
  company: string
  email: string
  phone: string
  address: string
  vat_number: string
}) {
  const supabase = await createServerSupabaseClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: data.name.trim(),
      company: toNullable(data.company),
      email: toNullable(data.email),
      phone: toNullable(data.phone),
      address: toNullable(data.address),
      vat_number: toNullable(data.vat_number),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/customers')
  revalidatePath('/quotes/new')
  return customer
}

export async function updateCustomer(data: {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  vat_number: string
}) {
  const supabase = await createServerSupabaseClient()

  const name = data.name.trim()
  if (!name) throw new Error('Customer name is required')

  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      name,
      company: toNullable(data.company),
      email: toNullable(data.email),
      phone: toNullable(data.phone),
      address: toNullable(data.address),
      vat_number: toNullable(data.vat_number),
    })
    .eq('id', data.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/customers')
  revalidatePath('/quotes/new')
  return customer
}

export async function deleteCustomer(customerId: string, password: string) {
  const supabase = await verifyCurrentUserPassword(password)
  await ensureCustomerHasNoJobs(supabase, customerId)

  const { error } = await supabase.from('customers').delete().eq('id', customerId)
  if (error) throw new Error(error.message)

  revalidatePath('/customers')
  revalidatePath('/quotes/new')
}
