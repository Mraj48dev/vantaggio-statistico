/**
 * Game Session Page - Dynamic Method Components
 *
 * Refactored session page that loads method-specific components
 * based on the selected method, with dynamic titles and interfaces.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

// Import method-specific components
import FibonacciSession from './components/FibonacciSession'
import FibonacciAdvancedSession from './components/FibonacciAdvancedSession'
import MartingaleSession from './components/MartingaleSession'
import JamesBondSession from './components/JamesBondSession'
import GenericSession from './components/GenericSession'
import { SimpleRouletteEngine } from '@/modules/games/domain/services/SimpleRouletteEngine'

// Simple helper function to check if any of the selected bets won
const checkWinningBets = (number: number, selectedBets: string[]): string[] => {
  return selectedBets.filter(betType => SimpleRouletteEngine.checkWin(betType, number))
}

interface GameSessionData {
  session: {
    id: { value: string }
    userId: string
    gameTypeId: string
    methodId: string
    config: {
      baseAmount: number
      stopLoss: number
      [key: string]: any
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
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)

  // Load session data and validate roulette logic
  useEffect(() => {
    // Validate SimpleRouletteEngine logic on component mount
    const testResult = SimpleRouletteEngine.runTests()
    if (testResult.passed) {
      console.log('✅ SimpleRouletteEngine validation passed!')
    } else {
      console.error('❌ SimpleRouletteEngine validation failed:', testResult.errors)
    }

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
            stopLoss: sessionConfig.stopLoss,
            ...sessionConfig // Include all config from stored session
          },
          status: 'ACTIVE',
          totalBets,
          profitLoss, // In cents
          currentProgression: [currentStep]
        },
        nextBetSuggestion: {
          shouldBet: Math.abs(profitLoss) < (sessionConfig.stopLoss * 100),
          betType: sessionConfig.betTarget || 'column_1',
          amount: fibSequence[currentStep],
          progression: fibSequence.slice(0, currentStep + 3),
          reason: totalBets === 0
            ? 'Iniziamo con la puntata base nella sequenza'
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

  const getMethodInfo = (methodId: string) => {
    const methodInfoMap: Record<string, { name: string; description: string }> = {
      'fibonacci': { name: 'Fibonacci Base', description: 'Metodo Fibonacci • European Roulette' },
      'fibonacci_advanced': { name: 'Fibonacci Avanzato', description: 'Fibonacci Avanzato • European Roulette' },
      'fibonacci_inverse': { name: 'Fibonacci Inverso', description: 'Fibonacci Inverso • European Roulette' },
      'martingale': { name: 'Martingale', description: 'Metodo Martingale • European Roulette' },
      'paroli': { name: 'Paroli', description: 'Sistema Paroli • European Roulette' },
      'dalembert': { name: "D'Alembert", description: "Sistema D'Alembert • European Roulette" },
      'labouchere': { name: 'Labouchere', description: 'Sistema Labouchere • European Roulette' },
      'james_bond': { name: 'James Bond', description: 'Strategia James Bond • European Roulette' }
    }

    return methodInfoMap[methodId] || { name: 'Metodo Sconosciuto', description: 'European Roulette' }
  }

  const processBetResult = async (number: number, actualBetAmount?: number, selectedBets?: string[]) => {
    if (!sessionData || !sessionData.nextBetSuggestion) return

    try {
      const gameResult = {
        number,
        color: getNumberColor(number),
        isEven: number % 2 === 0 && number !== 0,
        isHigh: number >= 19 && number <= 36
      }

      // Determine the target and calculate win
      let won = false
      const methodId = sessionData.session.methodId
      const currentBetAmount = actualBetAmount || sessionData.nextBetSuggestion.amount
      const isManualMethod = sessionData.session.config.manualBetInput === true ||
        (sessionData.session.config.manualBetInput !== false && methodId === 'fibonacci_advanced')

      // Use SimpleRouletteEngine for ALL win/loss determination
      if (selectedBets && selectedBets.length > 0) {
        // Use selected bets from roulette table
        const winningBets = checkWinningBets(number, selectedBets)
        won = winningBets.length > 0
        console.log(`🎯 SIMPLE ENGINE - Number: ${number}, Selected: [${selectedBets.join(', ')}], Winners: [${winningBets.join(', ')}], Result: ${won ? 'WON' : 'LOST'}`)
      } else {
        // Fallback: use method's default target
        const betTarget = sessionData.session.config.betTarget || 'column_1'
        const fallbackBets = [betTarget]
        won = SimpleRouletteEngine.checkWin(betTarget, number)
        console.log(`🎯 FALLBACK SIMPLE - Number: ${number}, Target: ${betTarget}, Result: ${won ? 'WON' : 'LOST'}`)
      }

      console.log(`\n🎲 FINAL RESULT: ${number} (${gameResult.color}) - Bet: €${currentBetAmount} - ${won ? '✅ WON' : '❌ LOST'}\n`)

      // Alert dettagliato
      const alertMessage = won
        ? `✅ HAI VINTO!\nNumero: ${number}\nPuntate vincenti: ${selectedBets && selectedBets.length > 0 ? checkWinningBets(number, selectedBets).join(', ') : 'Nessuna'}`
        : `❌ Hai perso\nNumero: ${number}\nPuntate: ${selectedBets && selectedBets.length > 0 ? selectedBets.join(', ') : 'Nessuna'}`

      // Update session data locally (demo simulation)
      const payout = won ? currentBetAmount : -currentBetAmount

      // Update local session state
      setSessionData(prev => {
        if (!prev) return prev

        const newTotalBets = prev.session.totalBets + 1
        const newProfitLoss = prev.session.profitLoss + (payout * 100) // Convert to cents

        // Method-specific progression logic
        const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
        let currentStep = prev.session.currentProgression[0] || 0
        let nextAmount = currentBetAmount
        let nextStep = currentStep

        if (methodId === 'fibonacci_advanced') {
          if (!won) {
            nextStep = Math.min(currentStep + 1, fibSequence.length - 1)
            nextAmount = fibSequence[nextStep]
          } else {
            nextStep = Math.max(0, currentStep - 2) // Go back 2 positions
            nextAmount = fibSequence[nextStep]
          }
        } else if (methodId === 'martingale') {
          if (!won) {
            nextAmount = currentBetAmount * 2 // Double on loss
          } else {
            nextAmount = prev.session.config.baseAmount // Reset to base
          }
        } else {
          // Default Fibonacci base logic
          if (!won) {
            nextStep = Math.min(currentStep + 1, fibSequence.length - 1)
            nextAmount = fibSequence[nextStep]
          } else {
            nextStep = 0
            nextAmount = fibSequence[0]
          }
        }

        // Check if should stop
        const shouldStop = Math.abs(newProfitLoss) >= (prev.session.config.stopLoss * 100)

        const updatedSessionData = {
          ...prev,
          session: {
            ...prev.session,
            totalBets: newTotalBets,
            profitLoss: newProfitLoss,
            currentProgression: [nextStep]
          },
          nextBetSuggestion: shouldStop ? null : {
            shouldBet: !shouldStop,
            betType: prev.session.config.betTarget || 'column_1',
            amount: nextAmount,
            progression: fibSequence.slice(0, nextStep + 3),
            reason: won
              ? `Vinto! ${methodId === 'fibonacci_advanced' ? 'Torna indietro 2 posizioni' : 'Reset alla base'} (step ${nextStep})`
              : `Perso. ${methodId === 'martingale' ? 'Raddoppia la puntata' : 'Avanziamo nella sequenza'} (step ${nextStep})`,
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

      // Show detailed result
      alert(alertMessage)

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

    const confirmed = confirm('Sei sicuro di voler terminare DEFINITIVAMENTE questa sessione?')
    if (!confirmed) return

    // Remove session from localStorage
    try {
      const stored = localStorage.getItem('activeSessions')
      if (stored) {
        const sessions = JSON.parse(stored)
        const updatedSessions = sessions.filter((s: any) => s.id !== sessionId)
        localStorage.setItem('activeSessions', JSON.stringify(updatedSessions))
        console.log(`Session ${sessionId} removed from localStorage`)
      }
    } catch (error) {
      console.error('Error removing session from localStorage:', error)
    }

    // Show session summary
    alert(`Sessione terminata definitivamente!\nPuntate totali: ${sessionData.session.totalBets}\nRisultato finale: €${(sessionData.session.profitLoss / 100).toFixed(2)}`)

    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  const renderMethodComponent = () => {
    if (!sessionData || !sessionData.nextBetSuggestion) return null

    const methodId = sessionData.session.methodId

    const commonProps = {
      sessionData,
      nextBetSuggestion: sessionData.nextBetSuggestion,
      onSubmitResult: processBetResult,
      processing,
      lastResult,
      getNumberColor
    }

    switch (methodId) {
      case 'fibonacci':
        return <FibonacciSession {...commonProps} />

      case 'fibonacci_advanced':
        return <FibonacciAdvancedSession {...commonProps} />

      case 'martingale':
        return <MartingaleSession {...commonProps} />

      case 'james_bond':
        return <JamesBondSession {...commonProps} />

      case 'paroli':
        return <GenericSession {...commonProps} methodDisplayName="Paroli" primaryColor="green-500" borderColor="green-500" />

      case 'dalembert':
        return <GenericSession {...commonProps} methodDisplayName="D'Alembert" primaryColor="indigo-500" borderColor="indigo-500" />

      case 'labouchere':
        return <GenericSession {...commonProps} methodDisplayName="Labouchere" primaryColor="orange-500" borderColor="orange-500" />

      case 'fibonacci_inverse':
        return <GenericSession {...commonProps} methodDisplayName="Fibonacci Inverso" primaryColor="teal-500" borderColor="teal-500" />

      default:
        return <FibonacciSession {...commonProps} />
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
  const methodInfo = getMethodInfo(session.methodId)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-500">🎯 Sessione Live</h1>
            <p className="text-sm text-gray-300">{methodInfo.description}</p>
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
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-500 mb-6">🎰 {methodInfo.name}</h2>

              {/* STOP LOSS ALERT */}
              {sessionData && !nextBetSuggestion && (
                <div className="mb-8 bg-gradient-to-r from-red-600/30 to-red-500/30 border-4 border-red-500 rounded-xl p-8 animate-pulse">
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-2xl mb-4">🚨 STOP LOSS RAGGIUNTO!</div>
                    <div className="text-xl text-white mb-4">
                      Perdita: €{Math.abs(sessionData.session.profitLoss / 100).toFixed(2)} / €{sessionData.session.config.stopLoss}
                    </div>
                    <div className="text-lg text-red-300 mb-4">
                      La sessione è stata automaticamente fermata per proteggere il tuo bankroll.
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={endSession}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 font-semibold"
                      >
                        🛑 Termina Sessione
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 font-semibold"
                      >
                        📋 Torna al Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Method-specific component */}
              {renderMethodComponent()}
            </div>
          </div>

          {/* Session Info & Method Guidance */}
          <div className="space-y-6">
            {/* Progression Details */}
            {nextBetSuggestion && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-3">📈 Progressione {methodInfo.name}</h3>
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
              <h3 className="text-yellow-500 font-semibold mb-3">🔧 {methodInfo.name}</h3>
              <div className="text-sm text-gray-300">
                <p>Metodo attivo: <strong>{methodInfo.name}</strong></p>
                <p>Target configurato: <strong>{session.config.betTarget || 'column_1'}</strong></p>
                {session.config.manualBetInput && (
                  <p className="text-blue-400 mt-2">💰 Input manuale attivo</p>
                )}
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