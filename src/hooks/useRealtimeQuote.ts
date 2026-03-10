import { useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Quote } from '@/types/database'

export function useRealtimeQuote(quoteId: string, onUpdate: (quote: Partial<Quote>) => void) {
  const supabase = createBrowserSupabaseClient()

  const subscribe = useCallback(() => {
    const channel = supabase
      .channel(`quote-${quoteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `id=eq.${quoteId}`,
        },
        (payload) => {
          onUpdate(payload.new as Partial<Quote>)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, quoteId, onUpdate])

  useEffect(() => {
    const unsubscribe = subscribe()
    return unsubscribe
  }, [subscribe])
}
