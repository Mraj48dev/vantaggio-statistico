/**
 * Fibonacci Base Session Component
 *
 * Standard Fibonacci method component with:
 * - Fixed column 1 betting
 * - Automatic bet calculation
 * - Reset on win, advance on loss
 */

'use client'

import { useState } from 'react'
import RouletteTable from './RouletteTable'

interface FibonacciSessionProps {
  sessionData: any
  nextBetSuggestion: any
  onSubmitResult: (number: number, amount?: number, selectedBets?: string[]) => void
  processing: boolean
  lastResult: number | null
  getNumberColor: (number: number) => string
}

export default function FibonacciSession({
  sessionData,
  nextBetSuggestion,
  onSubmitResult,
  processing,
  lastResult,
  getNumberColor
}: FibonacciSessionProps) {
  const [inputNumber, setInputNumber] = useState<string>('')
  // Auto-select target for Fibonacci base (always automatic)
  const [selectedBets, setSelectedBets] = useState<string[]>([sessionData?.session?.config?.betTarget || 'column_1'])

  const handleBetToggle = (betType: string) => {
    setSelectedBets(prev =>
      prev.includes(betType)
        ? prev.filter(bet => bet !== betType)
        : [...prev, betType]
    )
  }

  const handleSubmit = () => {
    const number = parseInt(inputNumber)

    // Validate input
    if (isNaN(number) || number < 0 || number > 36) {
      alert('Inserisci un numero valido da 0 a 36')
      return
    }

    if (!nextBetSuggestion?.shouldBet) {
      alert('Sessione terminata, non puoi inserire altri risultati')
      return
    }

    onSubmitResult(number, undefined, selectedBets)

    // Clear input for next round
    setInputNumber('')
  }

  return (
    <>
      {/* Current Bet Suggestion - PROMINENT */}
      {nextBetSuggestion && nextBetSuggestion.shouldBet && (
        <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-xl p-6">
          <div className="text-center">
            <div className="text-yellow-500 font-bold text-lg mb-2">🎯 PROSSIMA PUNTATA</div>
            <div className="text-4xl font-bold text-white mb-2">€{nextBetSuggestion.amount}</div>
            <div className="text-sm text-gray-300">{nextBetSuggestion.reason}</div>
          </div>
        </div>
      )}

      {/* Roulette Table */}
      <RouletteTable
        sessionData={sessionData}
        selectedBets={selectedBets}
        onBetToggle={handleBetToggle}
        disabled={processing}
        methodId="fibonacci"
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
          <button
            onClick={handleSubmit}
            disabled={processing || !inputNumber || !nextBetSuggestion?.shouldBet}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing || !inputNumber || !nextBetSuggestion?.shouldBet
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
        <div className="font-semibold text-blue-400 mb-2">📋 Come funziona (Fibonacci Base):</div>
        <div className="space-y-1">
          <div>1. Gioca alla roulette con la puntata suggerita</div>
          <div>2. Punta sempre su <strong>Prima Colonna</strong> (1,4,7,10,13,16,19,22,25,28,31,34)</div>
          <div>3. Inserisci il numero che è uscito (0-36)</div>
          <div>4. Su vincita: reset alla puntata base</div>
          <div>5. Su perdita: avanza nella sequenza Fibonacci</div>
        </div>
      </div>
    </>
  )
}