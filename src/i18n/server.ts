import { cookies } from 'next/headers'
import { en } from './en'
import { lv } from './lv'
import { type Locale, LOCALE_COOKIE } from './types'

export type { Locale }

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const stored = cookieStore.get(LOCALE_COOKIE)?.value
  return stored === 'en' ? 'en' : 'lv'
}

export async function getDict() {
  const locale = await getLocale()
  return locale === 'lv' ? lv : en
}
