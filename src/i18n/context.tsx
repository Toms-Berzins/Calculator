'use client'

import { createContext, useContext, useMemo } from 'react'
import { en, type Translations } from './en'
import { lv } from './lv'
import type { Locale } from './types'

const dictionaries: Record<Locale, Translations> = { en, lv }

interface I18nContext {
  t: Translations
  locale: Locale
}

const TranslationsContext = createContext<I18nContext>({ t: en, locale: 'en' })

export function TranslationsProvider({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) {
  const value = useMemo(() => ({ t: dictionaries[locale] ?? en, locale }), [locale])
  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  )
}

export function useT(): Translations {
  return useContext(TranslationsContext).t
}

export function useLocale(): Locale {
  return useContext(TranslationsContext).locale
}
