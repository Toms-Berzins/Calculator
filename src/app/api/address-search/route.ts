import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface GeoapifyResult {
  formatted?: string
  street?: string
  city?: string
  municipality?: string
  postcode?: string
  country?: string
}

function mapResult(r: GeoapifyResult) {
  return {
    formatted: r.formatted ?? '',
    street: r.street ?? null,
    city: r.city ?? r.municipality ?? null,
    postcode: r.postcode ?? null,
    country: r.country ?? null,
  }
}

async function fetchGeoapifySuggestions(text: string, apiKey: string) {
  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
  url.searchParams.set('text', text)
  url.searchParams.set('filter', 'countrycode:lv,lt,ee')
  url.searchParams.set('bias', 'countrycode:lv,lt,ee')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '6')
  url.searchParams.set('apiKey', apiKey)

  const upstream = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!upstream.ok) return []

  const data = (await upstream.json()) as { results?: GeoapifyResult[] }
  return (data.results ?? []).map(mapResult)
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const text = new URL(req.url).searchParams.get('text')?.trim() ?? ''
  if (text.length < 2) return Response.json([])

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY
  if (!apiKey) return Response.json([])

  const suggestions = await fetchGeoapifySuggestions(text, apiKey)
  return Response.json(suggestions)
}
