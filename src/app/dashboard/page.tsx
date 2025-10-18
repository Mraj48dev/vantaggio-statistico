/**
 * Dashboard Page - Game & Method Selection
 *
 * Updated dashboard integrating both Games and Methods modules.
 * Step 1: Choose Game → Step 2: Choose Method → Step 3: Configure → Step 4: Play
 */

'use client'

import { useState } from 'react'
import { useGames } from '@/modules/games/infrastructure/hooks/useGames'
import { useMethods } from '@/modules/methods/infrastructure/hooks/useMethods'
import { MethodConfigurationModal } from '@/shared/ui/components/MethodConfigurationModal'

interface MethodConfig {
  baseBet: number
  stopLoss: number
}

export default function DashboardPage() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [methodConfig, setMethodConfig] = useState<MethodConfig | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Use real hooks for games and methods
  const { gameTypes, loading: gamesLoading, error: gamesError } = useGames({
    activeOnly: true
  })

  const { methods, loading: methodsLoading, error: methodsError } = useMethods({
    userId: 'demo-user',
    gameTypeId: selectedGameId || undefined,
    activeOnly: true
  })

  // Fallback to static data if API fails
  const staticGameTypes = [
    {
      id: { value: 'european_roulette' },
      name: 'european_roulette',
      displayName: 'European Roulette',
      category: 'table' as const,
      config: { numbers: Array.from({length: 37}, (_, i) => i), minBet: 1, maxBet: 1000 },
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      getMinBet: () => 1,
      getMaxBet: () => 1000,
      isRouletteGame: () => true,
      isBlackjackGame: () => false,
      getRouletteConfig: () => ({ numbers: Array.from({length: 37}, (_, i) => i), minBet: 1, maxBet: 1000 })
    }
  ]

  // Use real data if available, fallback to static
  const displayGameTypes = gamesError ? staticGameTypes : gameTypes
  const displayLoading = gamesLoading
  const displayError = gamesError

  const selectedGame = displayGameTypes.find(game => game.id.value === selectedGameId)
  const selectedMethod = methods.find(method => method.id.value === selectedMethodId)

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethodId(methodId)
    // Reset config when selecting new method
    setMethodConfig(null)
  }

  const handleConfigureMethod = () => {
    if (selectedMethod) {
      setShowConfigModal(true)
    }
  }

  const handleConfigConfirm = (config: MethodConfig) => {
    setMethodConfig(config)
    setShowConfigModal(false)
  }

  const isReadyToPlay = selectedGame && selectedMethod && methodConfig

  const handleStartSession = async () => {
    if (!selectedGame || !selectedMethod || !methodConfig) return

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          gameTypeId: selectedGame.id.value,
          methodId: selectedMethod.id.value,
          config: {
            baseAmount: methodConfig.baseBet,
            stopLoss: methodConfig.stopLoss,
            methodConfig: {
              baseBet: methodConfig.baseBet,
              stopLoss: methodConfig.stopLoss
            }
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Errore nella creazione della sessione: ${error.error}`)
        return
      }

      const sessionData = await response.json()
      console.log('Sessione creata:', sessionData)

      // Redirect to game page with session ID
      window.location.href = `/game/${sessionData.sessionId.value}`
    } catch (error) {
      console.error('Errore durante la creazione della sessione:', error)
      alert('Errore durante la creazione della sessione')
    }
  }
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

          {displayLoading ? (
            <div className="text-center py-8">
              <div className="text-yellow-500">🎲 Caricando giochi disponibili...</div>
            </div>
          ) : displayError ? (
            <div className="text-center py-8">
              <div className="text-orange-500">⚠️ API temporaneamente non disponibile - Usando dati di fallback</div>
              <div className="text-sm text-gray-400 mt-2">Errore: {displayError}</div>
            </div>
          ) : displayGameTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Nessun gioco disponibile. Esegui il seeder prima.</div>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Popola Database
              </button>
            </div>
          ) : null}

          {displayGameTypes.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {displayGameTypes.map((game) => (
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
                        {game.category === 'table' && '🎰'}
                        {game.category === 'card' && '🃏'}
                        {game.category === 'slots' && '🎰'}
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

            {methodsLoading ? (
              <div className="text-center py-8">
                <div className="text-yellow-500">🎯 Caricando metodi disponibili...</div>
              </div>
            ) : methodsError ? (
              <div className="text-center py-8">
                <div className="text-orange-500">⚠️ Errore nel caricamento dei metodi</div>
                <div className="text-sm text-gray-400 mt-2">Errore: {methodsError}</div>
              </div>
            ) : methods.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Nessun metodo disponibile per questo gioco.</div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Available Methods */}
                {methods.map((method) => (
                  <div
                    key={method.id.value}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMethodId === method.id.value
                        ? 'bg-yellow-500/20 border-yellow-500'
                        : 'bg-gray-700 border-gray-600 hover:border-yellow-500/50'
                    }`}
                    onClick={() => handleMethodSelect(method.id.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {method.category === 'progressive' && '📈'}
                          {method.category === 'flat' && '📊'}
                          {method.category === 'system' && '🎯'}
                          {method.displayName}
                          <span className={`text-xs px-2 py-1 rounded ${
                            method.requiredPackage === 'free'
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          }`}>
                            {method.requiredPackage === 'free' ? 'GRATIS' : 'PREMIUM'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            method.getRiskLevel() === 'low' ? 'bg-green-500/20 text-green-400' :
                            method.getRiskLevel() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {method.getRiskLevel().toUpperCase()}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {method.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Compatibile con: {selectedGame.isRouletteGame() ? 'Roulette' : 'Altri giochi'}
                        </p>
                      </div>
                      {selectedMethodId === method.id.value && (
                        <div className="text-yellow-500 text-xl">✓</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Premium Methods Placeholder */}
                <div className="p-4 rounded-lg border border-gray-600 opacity-60 bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                        📊 Metodi Premium
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded">PREMIUM</span>
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Martingale, D'Alembert, Paroli e altri metodi avanzati.
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
            )}
          </div>
        )}

        {/* Step 3: Method Configuration */}
        {selectedGame && selectedMethod && !methodConfig && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-yellow-500/20">
            <h2 className="text-xl font-semibold text-yellow-500 mb-4">
              ⚙️ Passo 3: Configura {selectedMethod.displayName}
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-blue-400 font-semibold mb-2">📝 Configurazione Richiesta</h4>
              <p className="text-sm text-gray-300 mb-4">
                Prima di iniziare a giocare, devi configurare i parametri del metodo {selectedMethod.displayName}.
                Questo include la puntata base e il limite di perdita massima.
              </p>
              <button
                onClick={handleConfigureMethod}
                className="bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              >
                📋 Configura Metodo
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready to Play */}
        {isReadyToPlay && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-lg p-6 mb-8 border border-yellow-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-yellow-500 mb-2">
                🎯 Passo 4: Tutto Pronto!
              </h2>
              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-white">{selectedGame.displayName}</span> +
                  <span className="font-bold text-white"> {selectedMethod.displayName}</span>
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>💰 Puntata base: €{methodConfig.baseBet}</p>
                  <p>🛑 Stop loss: €{methodConfig.stopLoss}</p>
                  <p>🎯 Target: Prima colonna (paga 2:1)</p>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleStartSession}
                  className="bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  🎲 Inizia Sessione Live
                </button>
                <button
                  onClick={() => setMethodConfig(null)}
                  className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  ⚙️ Riconfigura
                </button>
                <button
                  onClick={() => window.open('/test-games', '_blank')}
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  📊 Modalità Demo
                </button>
              </div>
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

      {/* Method Configuration Modal */}
      {selectedMethod && (
        <MethodConfigurationModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onConfirm={handleConfigConfirm}
          method={{
            id: selectedMethod.id.value,
            displayName: selectedMethod.displayName,
            explanation: selectedMethod.explanation,
            configSchema: selectedMethod.configSchema,
            defaultConfig: selectedMethod.defaultConfig
          }}
        />
      )}
    </div>
  )
}