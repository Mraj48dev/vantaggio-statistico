import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ffb700', // Casino gold
          colorBackground: '#111827', // Dark gray
          colorInputBackground: '#1f2937',
          colorInputText: '#f9fafb',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
          card: 'bg-gray-800 border border-gray-700',
          headerTitle: 'text-yellow-500 font-display',
          socialButtonsBlockButton: 'border-gray-600 hover:bg-gray-700',
        },
        layout: {
          logoImageUrl: '/logo.png', // Add your logo
          showOptionalFields: false,
        }
      }}
    >
      <html
        lang="it"
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}
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
          className="min-h-screen bg-gray-900 font-sans antialiased"
          suppressHydrationWarning
        >
          {/* Accessibility skip link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                       bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg
                       font-semibold z-50"
          >
            Salta al contenuto principale
          </a>

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
    </ClerkProvider>
  )
}