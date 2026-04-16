import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDict } from '@/i18n/server'
import type { Material } from '@/types/database'
import Materials from './MaterialsContainer'

export default async function MaterialsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: materialsData } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .order('name')

  const dict = await getDict()

  const materials = (materialsData ?? []) as Material[]

  return <Materials materials={materials} dict={dict.materials} />
}
