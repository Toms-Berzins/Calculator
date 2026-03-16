import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getLocale } from '@/i18n/server'
import { TranslationsProvider } from '@/i18n/context'

export const metadata: Metadata = {
  title: 'QuoteCalc',
  description: 'Collaborative quoting tool',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QuoteCalc',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <head>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <TranslationsProvider locale={locale}>
          {children}
        </TranslationsProvider>
      </body>
    </html>
  )
}
