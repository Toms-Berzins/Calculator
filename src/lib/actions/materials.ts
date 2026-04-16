'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MaterialType } from '@/types/database'

const VALID_TYPES: MaterialType[] = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Other']

export async function createMaterial(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const name = String(formData.get('name') ?? '').trim()
  const material_type = String(formData.get('material_type') ?? '') as MaterialType
  const brand = String(formData.get('brand') ?? '').trim() || null
  const color = String(formData.get('color') ?? '').trim() || null
  const price_per_kg = parseFloat(String(formData.get('price_per_kg') ?? '0'))
  const stock_grams = parseInt(String(formData.get('stock_grams') ?? '0'), 10)

  if (!name) throw new Error('Name is required')
  if (!VALID_TYPES.includes(material_type)) throw new Error('Invalid material type')

  const { error } = await supabase.from('materials').insert({
    user_id: user.id,
    name,
    material_type,
    brand,
    color,
    price_per_kg: isNaN(price_per_kg) ? 0 : price_per_kg,
    stock_grams: isNaN(stock_grams) ? 0 : stock_grams,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/materials')
}

export async function updateMaterial(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const material_type = String(formData.get('material_type') ?? '') as MaterialType
  const brand = String(formData.get('brand') ?? '').trim() || null
  const color = String(formData.get('color') ?? '').trim() || null
  const price_per_kg = parseFloat(String(formData.get('price_per_kg') ?? '0'))
  const stock_grams = parseInt(String(formData.get('stock_grams') ?? '0'), 10)

  if (!name) throw new Error('Name is required')
  if (!VALID_TYPES.includes(material_type)) throw new Error('Invalid material type')

  const { error } = await supabase
    .from('materials')
    .update({
      name,
      material_type,
      brand,
      color,
      price_per_kg: isNaN(price_per_kg) ? 0 : price_per_kg,
      stock_grams: isNaN(stock_grams) ? 0 : stock_grams,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/materials')
}

export async function toggleMaterialActive(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = String(formData.get('id') ?? '')
  const current = formData.get('is_active') === 'true'

  const { error } = await supabase
    .from('materials')
    .update({ is_active: !current })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/materials')
}
