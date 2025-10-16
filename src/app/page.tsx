import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vantaggio Statistico | Strategie Casino Professionali',
  description: 'Piattaforma di strategie per casinò che guida i giocatori attraverso decisioni statisticamente informate. Roulette, Blackjack e molto altro.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-yellow-500 block">
                Vantaggio
              </span>
              <span className="text-yellow-400 block mt-2">
                Statistico
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-gray-300 leading-relaxed">
              La piattaforma di strategie per casinò che guida i giocatori attraverso
              <span className="text-yellow-500 font-semibold"> decisioni statisticamente informate</span>
              {' '}per massimizzare il potenziale di vincita.
            </p>

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-gray-900 text-xl font-bold">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  Strategie Provate
                </h3>
                <p className="text-gray-300 text-sm">
                  Fibonacci, Martingale, D'Alembert e altre strategie matematicamente fondate
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  Analytics Avanzati
                </h3>
                <p className="text-gray-300 text-sm">
                  Tracciamento performance, analisi sessioni e reporting dettagliato
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🎰</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  Roulette Engine
                </h3>
                <p className="text-gray-300 text-sm">
                  Simulatore roulette europea con calcoli in tempo reale
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Inizia Gratis
              </a>
              <a
                href="/sign-in"
                className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors"
              >
                Accedi
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex items-center justify-center space-x-8 text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">18+</div>
                <div className="text-sm">Gioco Responsabile</div>
              </div>
              <div className="w-px h-8 bg-yellow-500/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">🔒</div>
                <div className="text-sm">Sicuro & Protetto</div>
              </div>
              <div className="w-px h-8 bg-yellow-500/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">🇮🇹</div>
                <div className="text-sm">Made in Italy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Status */}
      <section className="py-12 border-t border-yellow-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-yellow-500 font-semibold text-sm">
              🚧 Piattaforma in sviluppo - Week 3: Auth & Permissions completati
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}