/**
 * Dashboard Page - Game & Method Selection
 *
 * Updated dashboard integrating the Games Module with game type selection
 * and method selection flow. Step 1: Choose Game → Step 2: Choose Method → Step 3: Play
 */

'use client'

import { useState } from 'react'
import { useGames, GameCategory } from '@/modules/games'

export default function DashboardPage() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  // Get available games from the Games Module
  const { gameTypes, loading: gamesLoading, error: gamesError } = useGames({
    activeOnly: true
  })

  const selectedGame = gameTypes.find(game => game.id.value === selectedGameId)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-500">
                Vantaggio Statistico
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="/dashboard"
                className="text-yellow-500 border-b-2 border-yellow-500 pb-4 px-3 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/test-games"
                className="text-gray-300 hover:text-yellow-500 transition-colors px-3 text-sm font-medium"
              >
                🎰 Test Games
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-yellow-500 transition-colors px-3 text-sm font-medium"
              >
                Strategie
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-yellow-500 transition-colors px-3 text-sm font-medium"
              >
                Sessioni
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Utente Demo
              </div>
              <a
                href="/"
                className="bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Esci
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-yellow-500 mb-2">
            Benvenuto nel tuo Dashboard
          </h2>
          <p className="text-gray-300">
            Gestisci il tuo account e monitora le tue strategie di betting.
          </p>
        </div>

        {/* Status Alert */}
        <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 text-xl mr-3">🎰</span>
            <div>
              <h3 className="text-green-500 font-semibold">
                Games Module Attivo!
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                European Roulette disponibile. Seleziona un gioco e un metodo per iniziare.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Piano Attuale
            </h3>
            <p className="text-2xl font-bold text-green-400">Gratuito</p>
            <p className="text-sm text-gray-300 mt-1">
              Fibonacci + Roulette Europea
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Sessioni Oggi
            </h3>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-300 mt-1">
              Limite: 1 simultanea
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Puntate Oggi
            </h3>
            <p className="text-2xl font-bold text-white">0 / 50</p>
            <p className="text-sm text-gray-300 mt-1">
              Limite giornaliero
            </p>
          </div>
        </div>

        {/* Step 1: Game Selection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-yellow-500/20">
          <h2 className="text-xl font-semibold text-yellow-500 mb-4">
            🎮 Passo 1: Seleziona Gioco
          </h2>

          {gamesLoading ? (
            <div className="text-center py-8">
              <div className="text-yellow-500">🎲 Caricando giochi disponibili...</div>
            </div>
          ) : gamesError ? (
            <div className="text-center py-8">
              <div className="text-red-500">❌ Errore nel caricamento: {gamesError}</div>
            </div>
          ) : gameTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Nessun gioco disponibile. Esegui il seeder prima.</div>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Popola Database
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gameTypes.map((game) => (
                <div
                  key={game.id.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedGameId === game.id.value
                      ? 'bg-yellow-500/20 border-yellow-500'
                      : 'bg-gray-700 border-gray-600 hover:border-yellow-500/50'
                  }`}
                  onClick={() => {
                    setSelectedGameId(game.id.value)
                    setSelectedMethod(null) // Reset method when game changes
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {game.category === GameCategory.TABLE && '🎰'}
                        {game.category === GameCategory.CARD && '🃏'}
                        {game.category === GameCategory.SLOTS && '🎰'}
                        {game.displayName}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {game.isRouletteGame() && (
                          `${game.getRouletteConfig()?.numbers.length} numeri • Min: €${game.getMinBet()} • Max: €${game.getMaxBet()}`
                        )}
                        {game.isBlackjackGame() && (
                          `${game.getBlackjackConfig()?.decks} mazzi • Min: €${game.getMinBet()}`
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Categoria: {game.category}
                      </p>
                    </div>
                    {selectedGameId === game.id.value && (
                      <div className="text-yellow-500 text-xl">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Method Selection */}
        {selectedGame && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-yellow-500/20">
            <h2 className="text-xl font-semibold text-yellow-500 mb-4">
              🎯 Passo 2: Seleziona Strategia per {selectedGame.displayName}
            </h2>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMethod === 'fibonacci'
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'bg-gray-700 border-gray-600 hover:border-yellow-500/50'
                }`}
                onClick={() => setSelectedMethod('fibonacci')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      📈 Metodo Fibonacci
                      <span className="bg-green-600 text-xs px-2 py-1 rounded">GRATIS</span>
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Sistema di progressione basato sulla sequenza di Fibonacci. Ideale per principianti.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Compatibile con: {selectedGame.isRouletteGame() ? 'Tutte le puntate esterne' : 'Puntate base'}
                    </p>
                  </div>
                  {selectedMethod === 'fibonacci' && (
                    <div className="text-yellow-500 text-xl">✓</div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-600 opacity-60 bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                      📊 Metodo Martingale
                      <span className="bg-blue-600 text-xs px-2 py-1 rounded">PREMIUM</span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Raddoppia la puntata dopo ogni perdita. Richiede capitale elevato.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Disponibile con piano Premium
                    </p>
                  </div>
                  <button className="bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed">
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-600 opacity-60 bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                      🎲 Metodo D'Alembert
                      <span className="bg-blue-600 text-xs px-2 py-1 rounded">PREMIUM</span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Aumenta di 1 unità dopo perdita, diminuisce di 1 dopo vincita.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Disponibile con piano Premium
                    </p>
                  </div>
                  <button className="bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed">
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-600 opacity-60 bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                      🚀 Metodo Paroli
                      <span className="bg-blue-600 text-xs px-2 py-1 rounded">PREMIUM</span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Sistema di progressione positiva. Raddoppia dopo ogni vincita.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Disponibile con piano Premium
                    </p>
                  </div>
                  <button className="bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Start Session */}
        {selectedGame && selectedMethod && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-lg p-6 mb-8 border border-yellow-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-yellow-500 mb-2">
                🎯 Passo 3: Inizia Sessione
              </h2>
              <p className="text-gray-300 mb-4">
                Configurazione: <span className="font-bold text-white">{selectedGame.displayName}</span> +
                <span className="font-bold text-white"> Metodo {selectedMethod === 'fibonacci' ? 'Fibonacci' : selectedMethod}</span>
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.open('/test-games', '_blank')}
                  className="bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  🎲 Inizia Sessione Live
                </button>
                <button
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  📊 Modalità Simulazione
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * La sessione live ti porta alla pagina di test del Games Module
              </p>
            </div>
          </div>
        )}

        {/* Account Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-gray-900 text-xl font-bold">👤</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-500">
                  Il Tuo Account
                </h3>
                <p className="text-gray-400 text-sm">
                  Gestisci le informazioni personali
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="bg-gray-700 px-3 py-2 rounded border border-gray-600">
                  <span className="text-gray-300">demo@vantaggiostatistico.com</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Membro da
                </label>
                <div className="bg-gray-700 px-3 py-2 rounded border border-gray-600">
                  <span className="text-gray-300">Ottobre 2024</span>
                </div>
              </div>
              <button className="w-full bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors">
                Modifica Profilo
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">🔒</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-500">
                  Sicurezza
                </h3>
                <p className="text-gray-400 text-sm">
                  Proteggi il tuo account
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Password:</span>
                <span className="text-green-500">✓ Sicura</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">2FA:</span>
                <span className="text-yellow-500">Non Attiva</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ultimo Accesso:</span>
                <span className="text-gray-300">Oggi</span>
              </div>
              <button className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition-colors">
                Impostazioni Sicurezza
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-500 mb-2">
              Sblocca Tutti i Metodi
            </h2>
            <p className="text-gray-300 mb-4">
              Accedi a Martingale, Paroli, D'Alembert e altri metodi avanzati
            </p>
            <button className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors">
              Upgrade a Premium - €29/mese
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | Vantaggio Statistico',
  description: 'La tua dashboard personale con accesso a tutti i metodi di betting e le statistiche delle sessioni.',
}