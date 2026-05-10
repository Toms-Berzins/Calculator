'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductMedia {
  slug: string
  image_ids: string[]
  model_id: string | null
}

// product_media is not in the generated types yet — use the generic client escape hatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = { from: (table: string) => any }

export async function getProductMedia(): Promise<ProductMedia[]> {
  const supabase = await createServerSupabaseClient() as unknown as AnyClient
  const { data } = await supabase
    .from('product_media')
    .select('slug, image_ids, model_id')
  return (data ?? []) as ProductMedia[]
}

export async function upsertProductMedia(
  slug: string,
  imageIds: string[],
  modelId: string | null,
): Promise<void> {
  const supabase = await createServerSupabaseClient() as unknown as AnyClient
  const { error } = await supabase.from('product_media').upsert(
    { slug, image_ids: imageIds, model_id: modelId, updated_at: new Date().toISOString() },
    { onConflict: 'slug' },
  )
  if (error) throw new Error((error as { message: string }).message)
  revalidatePath('/products')
}
