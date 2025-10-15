import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vantaggio Statistico | Strategie Casino Professionali',
  description: 'Piattaforma di strategie per casinò che guida i giocatori attraverso decisioni statisticamente informate. Roulette, Blackjack e molto altro.',
}

/**
 * Homepage component for Vantaggio Statistico casino platform
 *
 * This page serves as the main entry point and showcases:
 * - Hero section with platform value proposition
 * - Featured betting strategies (Fibonacci, Martingale, etc.)
 * - Statistics and success metrics
 * - Call-to-action for registration
 *
 * Design priorities:
 * - Luxury casino aesthetic with gold/green color scheme
 * - Mobile-first responsive design
 * - Performance optimized for gambling platform
 * - Italian localization throughout
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight">
              <span className="text-gradient-gold block">
                Vantaggio
              </span>
              <span className="text-casino-gold-100 block mt-2">
                Statistico
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-casino-gold-200 leading-relaxed">
              La piattaforma di strategie per casinò che guida i giocatori attraverso
              <span className="text-casino-gold-500 font-semibold"> decisioni statisticamente informate</span>
              {' '}per massimizzare il potenziale di vincita.
            </p>

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="casino-card">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-casino-gold-500 flex items-center justify-center">
                  <span className="text-casino-dark-50 text-xl font-bold">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
                  Strategie Provate
                </h3>
                <p className="text-casino-gold-200 text-sm">
                  Fibonacci, Martingale, D'Alembert e altre strategie matematicamente fondate
                </p>
              </div>

              <div className="casino-card">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-casino-green-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
                  Analytics Avanzati
                </h3>
                <p className="text-casino-gold-200 text-sm">
                  Tracciamento performance, analisi sessioni e reporting dettagliato
                </p>
              </div>

              <div className="casino-card">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-casino-red-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🎰</span>
                </div>
                <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
                  Roulette Engine
                </h3>
                <p className="text-casino-gold-200 text-sm">
                  Simulatore roulette europea con calcoli in tempo reale
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-casino-primary">
                Inizia Gratis
              </button>
              <button className="btn-casino-secondary">
                Scopri le Strategie
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex items-center justify-center space-x-8 text-casino-gold-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-casino-gold-500">18+</div>
                <div className="text-sm">Gioco Responsabile</div>
              </div>
              <div className="w-px h-8 bg-casino-gold-500/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-casino-gold-500">🔒</div>
                <div className="text-sm">Sicuro & Protetto</div>
              </div>
              <div className="w-px h-8 bg-casino-gold-500/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-casino-gold-500">🇮🇹</div>
                <div className="text-sm">Made in Italy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-casino-gold-500/10 blur-xl animate-pulse-gold"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-casino-green-500/10 blur-xl animate-pulse-gold"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-casino-red-500/5 blur-3xl"></div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 border-t border-casino-gold-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-casino-gold-500 mb-4">
              Anteprima Piattaforma
            </h2>
            <p className="text-casino-gold-200 max-w-2xl mx-auto">
              Un'interfaccia elegante e intuitiva progettata specificamente per l'ambiente del casinò
            </p>
          </div>

          {/* Mock interface preview */}
          <div className="max-w-6xl mx-auto">
            <div className="casino-card p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Game interface mockup */}
                <div className="space-y-6">
                  <div className="aspect-square rounded-lg bg-green-felt p-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-32 h-32 mx-auto rounded-full border-4 border-casino-gold-500 flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold">🎲</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Roulette Europea</h3>
                      <p className="text-sm opacity-80">Prototipo in sviluppo</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Strategy panel mockup */}
                <div className="space-y-4">
                  <div className="bg-casino-dark-100 rounded-lg p-4 border border-casino-gold-500/20">
                    <h4 className="text-casino-gold-500 font-semibold mb-2">Strategia Attiva</h4>
                    <div className="text-casino-gold-100">
                      <div className="text-sm text-casino-gold-300">Metodo: Fibonacci</div>
                      <div className="text-sm text-casino-gold-300">Puntata Base: €5,00</div>
                      <div className="text-sm text-casino-gold-300">Stop Loss: €100,00</div>
                    </div>
                  </div>

                  <div className="bg-casino-dark-100 rounded-lg p-4 border border-casino-gold-500/20">
                    <h4 className="text-casino-gold-500 font-semibold mb-2">Prossima Puntata</h4>
                    <div className="text-2xl font-bold text-casino-gold-500 mb-2">€8,00</div>
                    <div className="text-sm text-casino-gold-300">Su Rosso</div>
                  </div>

                  <div className="bg-casino-dark-100 rounded-lg p-4 border border-casino-gold-500/20">
                    <h4 className="text-casino-gold-500 font-semibold mb-2">Sessione Corrente</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-casino-gold-300">Puntate:</div>
                        <div className="text-casino-gold-100">12</div>
                      </div>
                      <div>
                        <div className="text-casino-gold-300">P&L:</div>
                        <div className="text-casino-green-400">+€23,50</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Status */}
      <section className="py-12 border-t border-casino-gold-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-casino-gold-500/20 border border-casino-gold-500/30">
            <span className="w-2 h-2 rounded-full bg-casino-gold-500 mr-2 animate-pulse"></span>
            <span className="text-casino-gold-500 font-semibold text-sm">
              🚧 Piattaforma in sviluppo - Fase 1: Foundation completata
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}