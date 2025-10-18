import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import '../globals.css'

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-elegant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Demo | Vantaggio Statistico',
  description: 'Demo della piattaforma di strategie per casinò'
}

interface DemoLayoutProps {
  children: React.ReactNode
}

/**
 * Demo layout senza autenticazione Clerk
 */
export default function DemoLayout({ children }: DemoLayoutProps) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#ffb700" />
      </head>
      <body
        className="min-h-screen bg-gray-900 font-sans antialiased"
        suppressHydrationWarning
      >
        <div id="main-content" className="relative">
          {children}
        </div>
      </body>
    </html>
  )
}