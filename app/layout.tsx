import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mwananchi - POS System',
  description: 'Offline-first Point-of-Sale system for Kenyan market traders',
  keywords: 'POS, point of sale, inventory, transactions, offline',
  authors: [{ name: 'Mwananchi Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#059669',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mwananchi" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
