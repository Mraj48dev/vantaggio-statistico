/**
 * Dashboard Page - STATIC VERSION NO API LOOPS
 */

'use client'

import { useState } from 'react'
import { STATIC_GAMES, STATIC_METHODS } from '@/shared/data/static-games'
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

  // NO API CALLS - ONLY STATIC DATA!
  const gameTypes = STATIC_GAMES
  const methods = STATIC_METHODS
  const gamesLoading = false
  const methodsLoading = false
  const gamesError = null
  const methodsError = null

  const selectedGame = gameTypes.find(g => g.id.value === selectedGameId)
  const selectedMethod = methods.find(m => m.id.value === selectedMethodId)

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedMethodId(null) // Reset method when game changes
    setMethodConfig(null)
  }

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethodId(methodId)
    setShowConfigModal(true)
  }

  const handleConfigureMethod = (config: MethodConfig) => {
    setMethodConfig(config)
    setShowConfigModal(false)
  }

  const handleStartSession = async () => {
    if (!selectedGame || !selectedMethod || !methodConfig) return

    try {
      // Try to create session via API, but don't fail if it doesn't work
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          gameTypeId: selectedGame.id.value,
          methodId: selectedMethod.id.value,
          config: {
            baseAmount: methodConfig.baseBet * 100, // Convert to cents
            stopLoss: methodConfig.stopLoss * 100
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.session?.id?.value) {
          // Real session created, redirect to live game
          window.location.href = `/game/${result.session.id.value}`
          return
        }
      }
    } catch (error) {
      console.warn('Session API failed, using demo mode:', error)
    }

    // Fallback: redirect to demo game page
    window.location.href = `/game/demo-session-${Date.now()}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">🎯 Dashboard</h1>
              <p className="text-sm text-gray-300">Gestisci il tuo account e monitora le tue strategie di betting.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Utente Demo</span>
              <button
                onClick={() => window.location.href = '/'}
                className="text-yellow-500 hover:text-yellow-400"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-green-500 text-2xl">🎮</div>
              <div>
                <h2 className="text-green-500 font-semibold">Games Module Attivo!</h2>
                <p className="text-sm text-gray-300">European Roulette disponibile. Seleziona un gioco e un metodo per iniziare.</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-500 font-semibold">Piano Attuale</h3>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">Gratuito</div>
              <p className="text-sm text-gray-300">Fibonacci + Roulette Europea</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-500 font-semibold">Sessioni Oggi</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">0</div>
              <p className="text-sm text-gray-300">Limite: 1 simultanea</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-500 font-semibold">Puntate Oggi</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">0 / 50</div>
              <p className="text-sm text-gray-300">Limite giornaliero</p>
            </div>
          </div>

          {/* Game Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🎯 Passo 1: Seleziona Gioco
            </h2>

            {gamesLoading ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-yellow-500 text-2xl mb-2">⏳</div>
                <p>Caricando giochi disponibili...</p>
              </div>
            ) : gamesError ? (
              <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">Errore nel caricamento dei giochi: {gamesError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameTypes.map((game) => (
                  <div
                    key={game.id.value}
                    onClick={() => handleSelectGame(game.id.value)}
                    className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                      selectedGameId === game.id.value
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">🎰</div>
                    <h3 className="font-semibold text-white mb-1">{game.displayName}</h3>
                    <p className="text-sm text-gray-400 mb-2">37 numeri • Min: €1 • Max: €100</p>
                    <span className="text-xs text-gray-500">Categoria: {game.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Method Selection */}
          {selectedGameId && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🔧 Passo 2: Seleziona Metodo
              </h2>

              {methodsLoading ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-yellow-500 text-2xl mb-2">⏳</div>
                  <p>Caricando metodi disponibili...</p>
                </div>
              ) : methodsError ? (
                <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400">Errore nel caricamento dei metodi: {methodsError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methods.map((method) => (
                    <div
                      key={method.id.value}
                      onClick={() => handleSelectMethod(method.id.value)}
                      className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                        selectedMethodId === method.id.value
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{method.displayName}</h3>
                          <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                            {method.category.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-2xl">📈</div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{method.description}</p>
                      <div className="text-xs text-gray-400">
                        ✅ Compatibile con {selectedGame?.displayName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Configuration & Start */}
          {selectedMethodId && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚙️ Passo 3: Configura & Inizia
              </h2>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Pronto per iniziare!</h3>
                    <p className="text-sm text-gray-300">
                      {selectedGame?.displayName} con metodo {selectedMethod?.displayName}
                    </p>
                  </div>
                  <div className="text-3xl">🚀</div>
                </div>

                {methodConfig ? (
                  <div className="mb-4 p-4 bg-green-600/10 border border-green-500/30 rounded">
                    <h4 className="text-green-500 font-medium mb-2">✅ Configurazione salvata:</h4>
                    <p className="text-sm text-gray-300">
                      Puntata base: €{methodConfig.baseBet} • Stop Loss: €{methodConfig.stopLoss}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-500">⚠️ Configura il metodo prima di iniziare</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
                  >
                    {methodConfig ? 'Modifica Configurazione' : 'Configura Metodo'}
                  </button>

                  {methodConfig && (
                    <button
                      onClick={handleStartSession}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-semibold"
                    >
                      🎲 Inizia Sessione Live
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 font-bold">👤</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Il Tuo Account</h3>
                  <p className="text-sm text-gray-400">Gestisci le informazioni personali</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    value="demo@vantaggiostatistico.com"
                    readOnly
                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Membro da</label>
                  <input
                    type="text"
                    value="Ottobre 2024"
                    readOnly
                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sicurezza</h3>
                  <p className="text-sm text-gray-400">Proteggi il tuo account</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Password:</span>
                  <span className="text-sm text-green-400">✓ Sicura</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">2FA:</span>
                  <span className="text-sm text-gray-400">Non Attiva</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Ultimo Accesso:</span>
                  <span className="text-sm text-white">Oggi</span>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors">
                  Impostazioni Sicurezza
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedMethod && (
        <MethodConfigurationModal
          method={selectedMethod}
          onSave={handleConfigureMethod}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  )
}