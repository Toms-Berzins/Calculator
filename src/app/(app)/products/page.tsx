import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProductMedia } from '@/lib/actions/productMedia'
import ProductsContainer from './ProductsContainer'

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const mediaList = await getProductMedia()

  return <ProductsContainer mediaList={mediaList} />
}
