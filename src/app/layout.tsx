import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

// Font configurations for the casino platform
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
  title: {
    default: 'Vantaggio Statistico | Casino Strategy Platform',
    template: '%s | Vantaggio Statistico'
  },
  description: 'Piattaforma di strategie per casinò che guida i giocatori attraverso decisioni statisticamente informate per massimizzare il potenziale di vincita.',
  keywords: [
    'casino',
    'roulette',
    'strategie',
    'fibonacci',
    'martingale',
    'statistiche',
    'gioco responsabile',
    'betting system'
  ],
  authors: [{ name: 'Vantaggio Statistico Team' }],
  creator: 'Vantaggio Statistico',
  publisher: 'Vantaggio Statistico',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://vantaggiostatistico.com',
    title: 'Vantaggio Statistico | Casino Strategy Platform',
    description: 'Piattaforma di strategie per casinò che guida i giocatori attraverso decisioni statisticamente informate.',
    siteName: 'Vantaggio Statistico',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vantaggio Statistico | Casino Strategy Platform',
    description: 'Piattaforma di strategie per casinò che guida i giocatori attraverso decisioni statisticamente informate.',
    creator: '@vantaggiostat',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Root layout component for the Vantaggio Statistico casino platform.
 *
 * This layout provides:
 * - Casino-themed styling with luxury fonts
 * - Responsive design for desktop and mobile
 * - Performance optimizations for casino gaming
 * - SEO optimizations for Italian market
 * - Accessibility features
 *
 * The layout follows a modular architecture where each feature
 * is contained within its own module for maintainability.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="it"
      className={cn(
        'casino-theme',
        inter.variable,
        playfair.variable,
        cormorant.variable
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical fonts for performance */}
        <link
          rel="preload"
          href="/fonts/playfair-display-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Casino-specific meta tags */}
        <meta name="theme-color" content="#ffb700" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vantaggio Statistico" />

        {/* Gambling responsibility */}
        <meta name="gambling-age-restriction" content="18+" />
        <meta name="responsible-gambling" content="true" />
      </head>

      <body
        className={cn(
          'min-h-screen bg-casino-gradient font-sans antialiased',
          'selection:bg-casino-gold-500 selection:text-casino-dark-50'
        )}
        suppressHydrationWarning
      >
        {/* Accessibility skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                     bg-casino-gold-500 text-casino-dark-50 px-4 py-2 rounded-lg
                     font-semibold z-50 transition-all duration-200"
        >
          Salta al contenuto principale
        </a>

        {/* Background pattern for casino ambiance */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,0,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(22,163,74,0.05),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(220,38,38,0.05),transparent_50%)]" />
        </div>

        {/* Main app content */}
        <div id="main-content" className="relative">
          {children}
        </div>

        {/* Casino platform scripts and analytics will be added here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics for Italian market - will be configured later */}
            {/* Gambling compliance tracking - will be configured later */}
          </>
        )}
      </body>
    </html>
  )
}