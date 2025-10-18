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
  const [spinning, setSpinning] = useState(false)
  const [lastResult, setLastResult] = useState<number | null>(null)

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  const loadSessionData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sessions?userId=demo-user`)

      if (!response.ok) {
        throw new Error('Failed to load session')
      }

      const data = await response.json()

      if (data.session) {
        setSessionData(data)
      } else {
        setError('No active session found')
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const spinRoulette = () => {
    setSpinning(true)

    // Simulate roulette spin with random result
    setTimeout(() => {
      const result = Math.floor(Math.random() * 37) // 0-36
      setLastResult(result)
      setSpinning(false)

      // Process the bet result
      processBetResult(result)
    }, 3000) // 3 second spin animation
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

      // Call the place bet API with current bet suggestion
      const response = await fetch(`/api/sessions/${sessionId}/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number,
          color: gameResult.color,
          isEven: gameResult.isEven,
          isHigh: gameResult.isHigh,
          betType: sessionData.nextBetSuggestion.betType,
          betAmount: sessionData.nextBetSuggestion.amount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to place bet')
      }

      const betResult = await response.json()

      // Show result with updated information
      const resultMessage = won ? 'HAI VINTO!' : 'Hai perso'
      const nextBetInfo = betResult.nextBetSuggestion
        ? `Prossima puntata: €${betResult.nextBetSuggestion.amount}`
        : 'Sessione terminata'

      alert(`Risultato: ${number} - ${resultMessage} - ${nextBetInfo}`)

      // Check if session ended automatically
      if (betResult.sessionEnded) {
        alert(`Sessione terminata automaticamente: ${betResult.endReason}`)
        window.location.href = '/dashboard'
        return
      }

      // Reload session data to get updated state
      await loadSessionData()

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

    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'MANUAL'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to end session')
      }

      const result = await response.json()

      // Show session summary
      alert(`Sessione terminata!\nPuntate totali: ${result.summary.totalBets}\nRisultato finale: €${(result.summary.finalBalance / 100).toFixed(2)}`)

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error ending session:', error)
      alert('Errore nel terminare la sessione. Riprova.')
    }
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

              {/* Simplified Roulette Wheel */}
              <div className="relative mx-auto w-64 h-64 mb-6">
                <div className={`w-full h-full rounded-full border-4 border-yellow-500 bg-gradient-conic from-red-600 via-black to-green-600 flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-500">
                      {spinning ? '🎲' : (lastResult !== null ? lastResult : '?')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Result */}
              {lastResult !== null && !spinning && (
                <div className="mb-6">
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

              {/* Spin Button */}
              <button
                onClick={spinRoulette}
                disabled={spinning || !sessionData?.nextBetSuggestion?.shouldBet}
                className={`px-8 py-4 rounded-lg font-semibold text-lg ${
                  spinning || !sessionData?.nextBetSuggestion?.shouldBet
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                }`}
              >
                {spinning
                  ? '🎲 Girando...'
                  : sessionData?.nextBetSuggestion?.shouldBet
                    ? '🎯 GIRA LA ROULETTE'
                    : '⚠️ Sessione Terminata'
                }
              </button>
            </div>
          </div>

          {/* Session Info & Method Guidance */}
          <div className="space-y-6">
            {/* Current Bet Suggestion */}
            {nextBetSuggestion && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-yellow-500 font-semibold mb-3">🎯 Prossima Puntata</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Tipo: </span>
                    <span className="text-white font-medium">Prima Colonna</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Importo: </span>
                    <span className="text-yellow-400 font-bold">€{nextBetSuggestion.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Progressione: </span>
                    <span className="text-white">[{nextBetSuggestion.progression.join(', ')}]</span>
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
              <h3 className="text-yellow-500 font-semibold mb-3">⚡ Azioni Rapide</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-500"
                >
                  📋 Torna al Dashboard
                </button>
                <button
                  onClick={endSession}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-500"
                >
                  🛑 Termina Sessione
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}