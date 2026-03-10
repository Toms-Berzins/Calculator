import type { Metadata, Viewport } from 'next'
import './globals.css'

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
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
