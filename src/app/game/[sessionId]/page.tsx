/**
 * Game Session Page - Live Gaming with Method Integration
 *
 * Real-time gaming page where users play using their configured method.
 * Integrates Games + Methods + Sessions modules for complete experience.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface GameSessionData {
  session: {
    id: { value: string }
    userId: string
    gameTypeId: string
    methodId: string
    config: {
      baseAmount: number
      stopLoss: number
    }
    status: string
    totalBets: number
    profitLoss: number
    currentProgression: number[]
  }
  nextBetSuggestion: {
    shouldBet: boolean
    betType: string
    amount: number
    progression: number[]
    reason: string
    stopSession: boolean
  } | null
}

export default function GameSessionPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string

  const [sessionData, setSessionData] = useState<GameSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputNumber, setInputNumber] = useState<string>('')
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  const loadSessionData = async () => {
    try {
      setLoading(true)

      // Try to load session from localStorage
      const stored = localStorage.getItem('activeSessions')
      let storedSession = null

      if (stored) {
        const sessions = JSON.parse(stored)
        storedSession = sessions.find((s: any) => s.id === sessionId)
      }

      // Create session data based on localStorage or defaults
      const sessionConfig = storedSession?.config || { baseAmount: 1, stopLoss: 100 }
      const totalBets = storedSession?.totalBets || 0
      const profitLoss = storedSession?.profitLoss || 0

      // Calculate current fibonacci position based on total bets
      const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
      const currentStep = Math.min(totalBets, fibSequence.length - 1)

      const demoSessionData: GameSessionData = {
        session: {
          id: { value: sessionId },
          userId: 'demo-user',
          gameTypeId: storedSession?.gameTypeId || 'european_roulette',
          methodId: storedSession?.methodId || 'fibonacci',
          config: {
            baseAmount: sessionConfig.baseBet || sessionConfig.baseAmount,
            stopLoss: sessionConfig.stopLoss
          },
          status: 'ACTIVE',
          totalBets,
          profitLoss, // In cents
          currentProgression: [currentStep]
        },
        nextBetSuggestion: {
          shouldBet: Math.abs(profitLoss) < (sessionConfig.stopLoss * 100),
          betType: 'column_1',
          amount: fibSequence[currentStep],
          progression: fibSequence.slice(0, currentStep + 3),
          reason: totalBets === 0
            ? 'Iniziamo con la puntata base nella sequenza Fibonacci'
            : `Continuiamo dalla posizione ${currentStep} nella sequenza`,
          stopSession: Math.abs(profitLoss) >= (sessionConfig.stopLoss * 100)
        }
      }

      setSessionData(demoSessionData)
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const submitResult = () => {
    const number = parseInt(inputNumber)

    // Validate input
    if (isNaN(number) || number < 0 || number > 36) {
      alert('Inserisci un numero valido da 0 a 36')
      return
    }

    if (!sessionData?.nextBetSuggestion?.shouldBet) {
      alert('Sessione terminata, non puoi inserire altri risultati')
      return
    }

    setProcessing(true)
    setLastResult(number)

    // Process the bet result
    processBetResult(number)

    // Clear input for next round
    setInputNumber('')
    setProcessing(false)
  }

  const processBetResult = async (number: number) => {
    if (!sessionData || !sessionData.nextBetSuggestion) return

    try {
      const gameResult = {
        number,
        color: getNumberColor(number),
        isEven: number % 2 === 0 && number !== 0,
        isHigh: number >= 19 && number <= 36
      }

      // For column 1 bet, check if won
      const firstColumnNumbers = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
      const won = firstColumnNumbers.includes(number)

      console.log(`Spun: ${number} (${gameResult.color}) - Column 1 bet: ${won ? 'WON' : 'LOST'}`)

      // DEMO MODE: Simulate bet processing without API
      console.log('Processing demo bet - API disabled due to UUID corruption')

      // Update session data locally (demo simulation)
      const currentBetAmount = sessionData.nextBetSuggestion.amount
      const payout = won ? currentBetAmount * 2 : -currentBetAmount // Column pays 2:1

      // Update local session state
      setSessionData(prev => {
        if (!prev) return prev

        const newTotalBets = prev.session.totalBets + 1
        const newProfitLoss = prev.session.profitLoss + (payout * 100) // Convert to cents

        // Correct Fibonacci progression logic
        const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
        let currentStep = prev.session.currentProgression[0] || 0 // Current position in sequence
        let nextAmount = currentBetAmount
        let nextStep = currentStep

        if (!won) {
          // On loss: move forward in fibonacci sequence
          nextStep = Math.min(currentStep + 1, fibSequence.length - 1)
          nextAmount = fibSequence[nextStep]
        } else {
          // On win: go back 2 steps, minimum position 0
          nextStep = Math.max(currentStep - 2, 0)
          nextAmount = fibSequence[nextStep]
        }

        // Check if should stop (demo stop loss)
        const shouldStop = Math.abs(newProfitLoss) >= (prev.session.config.stopLoss * 100)

        const updatedSessionData = {
          ...prev,
          session: {
            ...prev.session,
            totalBets: newTotalBets,
            profitLoss: newProfitLoss,
            currentProgression: [nextStep] // Save current position in fibonacci
          },
          nextBetSuggestion: shouldStop ? null : {
            shouldBet: !shouldStop,
            betType: 'column_1',
            amount: nextAmount,
            progression: fibSequence.slice(0, nextStep + 3), // Show current and next few steps
            reason: won
              ? `Vinto! Torniamo indietro 2 posizioni (step ${nextStep})`
              : `Perso. Avanziamo nella sequenza (step ${nextStep})`,
            stopSession: shouldStop
          }
        }

        // Save to localStorage
        try {
          const stored = localStorage.getItem('activeSessions')
          if (stored) {
            const sessions = JSON.parse(stored)
            const sessionIndex = sessions.findIndex((s: any) => s.id === sessionId)

            if (sessionIndex !== -1) {
              sessions[sessionIndex] = {
                ...sessions[sessionIndex],
                totalBets: newTotalBets,
                profitLoss: newProfitLoss,
                lastActivity: Date.now()
              }
              localStorage.setItem('activeSessions', JSON.stringify(sessions))
            }
          }
        } catch (error) {
          console.error('Error updating session in localStorage:', error)
        }

        return updatedSessionData
      })

      // Show result with updated information
      const resultMessage = won ? 'HAI VINTO!' : 'Hai perso'
      const nextBetInfo = sessionData.nextBetSuggestion?.amount
        ? `Prossima puntata: €${sessionData.nextBetSuggestion.amount}`
        : 'Continua a giocare!'

      alert(`Risultato: ${number} - ${resultMessage} - ${nextBetInfo}`)

    } catch (error) {
      console.error('Error processing bet result:', error)
      alert('Errore nel processare la puntata. Riprova.')
    }
  }

  const getNumberColor = (number: number): string => {
    if (number === 0) return 'green'
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    return redNumbers.includes(number) ? 'red' : 'black'
  }

  const endSession = async () => {
    if (!sessionData) return

    const confirmed = confirm('Sei sicuro di voler terminare la sessione?')
    if (!confirmed) return

    // DEMO MODE: Skip API and show summary directly
    console.log('Ending demo session - API disabled due to UUID corruption')

    // Show session summary
    alert(`Sessione Demo terminata!\nPuntate totali: ${sessionData.session.totalBets}\nRisultato finale: €${(sessionData.session.profitLoss / 100).toFixed(2)}`)

    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-2xl mb-4">🎲</div>
          <div>Caricando sessione di gioco...</div>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌</div>
          <div className="mb-4">{error || 'Sessione non trovata'}</div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-400"
          >
            Torna al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { session, nextBetSuggestion } = sessionData

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-500">🎯 Sessione Live</h1>
            <p className="text-sm text-gray-300">Metodo Fibonacci • European Roulette</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Saldo: </span>
              <span className={session.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                €{(session.profitLoss / 100).toFixed(2)}
              </span>
            </div>
            <button
              onClick={endSession}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              Fine Sessione
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-500 mb-6">🎰 Roulette Europea</h2>

              {/* Current Bet Suggestion - PROMINENT */}
              {nextBetSuggestion && (
                <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-yellow-500 font-bold text-lg mb-2">🎯 PROSSIMA PUNTATA</div>
                    <div className="text-4xl font-bold text-white mb-2">€{nextBetSuggestion.amount}</div>
                    <div className="text-lg text-yellow-400 font-semibold mb-2">Prima Colonna (1,4,7,10,13,16,19,22,25,28,31,34)</div>
                    <div className="text-sm text-gray-300">{nextBetSuggestion.reason}</div>
                  </div>
                </div>
              )}

              {/* Result Input Section */}
              <div className="mb-8">
                <div className="text-lg text-gray-300 mb-4">
                  Inserisci il numero uscito alla roulette (0-36):
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <input
                    type="number"
                    min="0"
                    max="36"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && submitResult()}
                    className="w-24 h-12 text-center text-2xl font-bold bg-gray-700 border-2 border-yellow-500 rounded-lg text-white"
                    placeholder="?"
                    disabled={processing || !sessionData?.nextBetSuggestion?.shouldBet}
                  />
                  <button
                    onClick={submitResult}
                    disabled={processing || !inputNumber || !sessionData?.nextBetSuggestion?.shouldBet}
                    className={`px-6 py-3 rounded-lg font-semibold ${
                      processing || !inputNumber || !sessionData?.nextBetSuggestion?.shouldBet
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                    }`}
                  >
                    {processing ? '⏳ Elaborando...' : '✅ Conferma'}
                  </button>
                </div>
              </div>

              {/* Last Result */}
              {lastResult !== null && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="text-lg text-gray-300 mb-2">Ultimo risultato:</div>
                  <div className={`text-3xl font-bold ${
                    getNumberColor(lastResult) === 'red' ? 'text-red-400' :
                    getNumberColor(lastResult) === 'black' ? 'text-white' :
                    'text-green-400'
                  }`}>
                    {lastResult} ({getNumberColor(lastResult)})
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-sm text-gray-400 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="font-semibold text-blue-400 mb-2">📋 Come funziona:</div>
                <div className="space-y-1">
                  <div>1. Gioca alla roulette con la puntata suggerita</div>
                  <div>2. Inserisci il numero che è uscito (0-36)</div>
                  <div>3. Il sistema calcolerà automaticamente se hai vinto</div>
                  <div>4. Ti dirà la prossima puntata secondo Fibonacci</div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info & Method Guidance */}
          <div className="space-y-6">
            {/* Fibonacci Progression Details */}
            {nextBetSuggestion && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-3">📈 Progressione Fibonacci</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Sequenza: </span>
                    <span className="text-white font-mono">[{nextBetSuggestion.progression.join(', ')}]</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Posizione corrente: </span>
                    <span className="text-blue-400 font-bold">Step {sessionData?.session.currentProgression[0] || 0}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-2">
                    💡 {nextBetSuggestion.reason}
                  </div>
                </div>
              </div>
            )}

            {/* Session Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-yellow-500 font-semibold mb-3">📊 Statistiche Sessione</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Puntate totali:</span>
                  <span className="text-white">{session.totalBets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profitto/Perdita:</span>
                  <span className={session.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                    €{(session.profitLoss / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-red-400">€{session.config.stopLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Puntata Base:</span>
                  <span className="text-white">€{session.config.baseAmount}</span>
                </div>
              </div>
            </div>

            {/* Method Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-yellow-500 font-semibold mb-3">🔧 Metodo Fibonacci</h3>
              <div className="text-sm text-gray-300">
                <p className="mb-2">✅ Su vincita: torna indietro 2 posizioni</p>
                <p className="mb-2">❌ Su perdita: avanza nella sequenza</p>
                <p>🎯 Target: Prima colonna (paga 2:1)</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-yellow-500 font-semibold mb-3">⚡ Azioni</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 text-sm"
                >
                  📋 Pausa (Torna al Dashboard)
                </button>
                <div className="text-xs text-gray-400 px-2">
                  ↳ La sessione rimane attiva per 24h
                </div>
                <button
                  onClick={endSession}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 text-sm"
                >
                  🛑 Termina Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}