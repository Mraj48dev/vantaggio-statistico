/**
 * Fibonacci Advanced Session Component - Manual Input Support
 *
 * Specialized component for Fibonacci Advanced method with:
 * - Manual bet amount input
 * - Automatic win/loss determination based on target
 * - Support for columns and dozens
 */

'use client'

import { useState } from 'react'
import RouletteTable from './RouletteTable'

interface FibonacciAdvancedSessionProps {
  sessionData: any
  nextBetSuggestion: any
  onSubmitResult: (number: number, amount?: number, selectedBets?: string[]) => void
  processing: boolean
  lastResult: number | null
  getNumberColor: (number: number) => string
}

export default function FibonacciAdvancedSession({
  sessionData,
  nextBetSuggestion,
  onSubmitResult,
  processing,
  lastResult,
  getNumberColor
}: FibonacciAdvancedSessionProps) {
  const [inputNumber, setInputNumber] = useState<string>('')
  const [inputAmount, setInputAmount] = useState<string>('')

  // Fibonacci Advanced is ALWAYS manual unless explicitly disabled
  const isManualMethod = sessionData?.session?.config?.manualBetInput !== false
  const betTarget = sessionData?.session?.config?.betTarget || 'column_1'

  // Auto-select bet based on method target for automatic methods
  const [selectedBets, setSelectedBets] = useState<string[]>(
    isManualMethod ? [] : [betTarget]
  )

  const handleBetToggle = (betType: string) => {
    setSelectedBets(prev =>
      prev.includes(betType)
        ? prev.filter(bet => bet !== betType)
        : [...prev, betType]
    )
  }

  const targetDescriptions: Record<string, string> = {
    'column_1': '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)',
    'column_2': '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)',
    'column_3': '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)',
    'dozen_1': '1ª Dozzina (1-12)',
    'dozen_2': '2ª Dozzina (13-24)',
    'dozen_3': '3ª Dozzina (25-36)'
  }

  const targetDesc = targetDescriptions[betTarget] || 'Prima Colonna (1,4,7,10,13,16,19,22,25,28,31,34)'

  const handleSubmit = () => {
    const number = parseInt(inputNumber)

    // Validate number input
    if (isNaN(number) || number < 0 || number > 36) {
      alert('Inserisci un numero valido da 0 a 36')
      return
    }

    let betAmount = nextBetSuggestion?.amount || 0

    if (isManualMethod) {
      const manualAmount = parseFloat(inputAmount)

      // Validate manual amount input
      if (isNaN(manualAmount) || manualAmount <= 0) {
        alert('Inserisci un importo valido per la puntata')
        return
      }

      betAmount = manualAmount
    }

    if (!nextBetSuggestion?.shouldBet) {
      alert('Sessione terminata, non puoi inserire altri risultati')
      return
    }

    onSubmitResult(number, betAmount)

    // Clear inputs for next round
    setInputNumber('')
    if (isManualMethod) {
      setInputAmount('')
    }
  }

  return (
    <>
      {/* Current Bet Suggestion - PROMINENT */}
      {nextBetSuggestion && nextBetSuggestion.shouldBet && (
        <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-xl p-6">
          <div className="text-center">
            <div className="text-yellow-500 font-bold text-lg mb-2">
              {isManualMethod ? '💰 TARGET & SUGGERIMENTO' : '🎯 PROSSIMA PUNTATA'}
            </div>

            {isManualMethod ? (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-2">
                  <div className="text-sm text-yellow-300 mb-1">Suggerimento Fibonacci:</div>
                  <div className="text-2xl font-bold text-white">€{nextBetSuggestion.amount}</div>
                </div>
                <div className="text-sm text-gray-300">Seleziona le puntate desiderate nella tabella sottostante</div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-white mb-2">€{nextBetSuggestion.amount}</div>
                <div className="text-sm text-gray-300">{nextBetSuggestion.reason}</div>
                <div className="text-sm text-yellow-300 mt-2">🎯 Puntata automatica su: {targetDesc}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Roulette Table */}
      <RouletteTable
        sessionData={sessionData}
        selectedBets={selectedBets}
        onBetToggle={handleBetToggle}
        disabled={processing}
        methodId="fibonacci_advanced"
      />

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
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-24 h-12 text-center text-2xl font-bold bg-gray-700 border-2 border-yellow-500 rounded-lg text-white"
            placeholder="?"
            disabled={processing || !nextBetSuggestion?.shouldBet}
          />

          {isManualMethod && (
            <>
              <div className="text-white text-lg">+</div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400 mb-1">Importo puntato (€)</div>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-20 h-12 text-center text-xl font-bold bg-gray-700 border-2 border-blue-500 rounded-lg text-white"
                  placeholder="0"
                  disabled={processing || !nextBetSuggestion?.shouldBet}
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={processing || !inputNumber || (isManualMethod && !inputAmount) || !nextBetSuggestion?.shouldBet}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing || !inputNumber || (isManualMethod && !inputAmount) || !nextBetSuggestion?.shouldBet
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
            }`}
          >
            {processing ? '⏳ Elaborando...' : '✅ Conferma'}
          </button>
        </div>

        {isManualMethod && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
            <div className="text-blue-400 font-semibold mb-1">💡 Modalità Input Manuale Attiva</div>
            <div className="text-gray-300">
              Inserisci il <strong>numero uscito</strong> e l'<strong>importo che hai puntato</strong>.
              Il sistema determinerà automaticamente se hai vinto in base al target scelto.
            </div>
            {nextBetSuggestion && (
              <div className="text-gray-400 mt-2">
                Suggerimento Fibonacci: €{nextBetSuggestion.amount}
              </div>
            )}
          </div>
        )}
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
        <div className="font-semibold text-blue-400 mb-2">📋 Come funziona (Fibonacci Avanzato):</div>
        <div className="space-y-1">
          {isManualMethod ? (
            <>
              <div>1. Punta sul target mostrato: <strong>{targetDesc}</strong></div>
              <div>2. Inserisci il numero uscito e l'importo che hai puntato</div>
              <div>3. Il sistema calcola automaticamente vincita/perdita</div>
              <div>4. La progressione Fibonacci si aggiorna automaticamente</div>
            </>
          ) : (
            <>
              <div>1. Gioca alla roulette con la puntata suggerita</div>
              <div>2. Punta su: <strong>{targetDesc}</strong></div>
              <div>3. Inserisci il numero che è uscito (0-36)</div>
              <div>4. Il sistema calcolerà la prossima puntata Fibonacci</div>
            </>
          )}
        </div>
      </div>
    </>
  )
}