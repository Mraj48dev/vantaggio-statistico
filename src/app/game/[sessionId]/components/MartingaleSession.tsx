/**
 * Martingale Session Component
 *
 * Classic Martingale method component with:
 * - Even-money betting (red/black, even/odd, high/low)
 * - Double on loss strategy
 * - Reset to base on win
 */

'use client'

import { useState } from 'react'
import RouletteTable from './RouletteTable'

interface MartingaleSessionProps {
  sessionData: any
  nextBetSuggestion: any
  onSubmitResult: (number: number, amount?: number, selectedBets?: string[]) => void
  processing: boolean
  lastResult: number | null
  getNumberColor: (number: number) => string
}

export default function MartingaleSession({
  sessionData,
  nextBetSuggestion,
  onSubmitResult,
  processing,
  lastResult,
  getNumberColor
}: MartingaleSessionProps) {
  const [inputNumber, setInputNumber] = useState<string>('')
  const [selectedBets, setSelectedBets] = useState<string[]>([])

  const handleBetToggle = (betType: string) => {
    setSelectedBets(prev =>
      prev.includes(betType)
        ? prev.filter(bet => bet !== betType)
        : [...prev, betType]
    )
  }

  const betTarget = sessionData?.session?.config?.betTarget || 'red'

  const targetDescriptions: Record<string, string> = {
    'red': 'Rosso',
    'black': 'Nero',
    'even': 'Pari',
    'odd': 'Dispari',
    'high': 'Alto (19-36)',
    'low': 'Basso (1-18)'
  }

  const targetDesc = targetDescriptions[betTarget] || 'Rosso'

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
        <div className="mb-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500 rounded-xl p-6">
          <div className="text-center">
            <div className="text-red-500 font-bold text-lg mb-2">🎯 PROSSIMA PUNTATA MARTINGALE</div>
            <div className="text-4xl font-bold text-white mb-2">€{nextBetSuggestion.amount}</div>
            <div className="text-lg text-red-400 font-semibold mb-2">{targetDesc} (Paga 1:1)</div>
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
        methodId="martingale"
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
            className="w-24 h-12 text-center text-2xl font-bold bg-gray-700 border-2 border-red-500 rounded-lg text-white"
            placeholder="?"
            disabled={processing || !nextBetSuggestion?.shouldBet}
          />
          <button
            onClick={handleSubmit}
            disabled={processing || !inputNumber || !nextBetSuggestion?.shouldBet}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing || !inputNumber || !nextBetSuggestion?.shouldBet
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-400'
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
      <div className="text-sm text-gray-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="font-semibold text-red-400 mb-2">📋 Come funziona (Martingale):</div>
        <div className="space-y-1">
          <div>1. Gioca alla roulette con la puntata suggerita</div>
          <div>2. Punta sempre su <strong>{targetDesc}</strong> (puntata even-money 1:1)</div>
          <div>3. Inserisci il numero che è uscito (0-36)</div>
          <div>4. Su vincita: reset alla puntata base</div>
          <div>5. Su perdita: raddoppia la puntata</div>
          <div className="text-red-300">⚠️ Attenzione: Le puntate crescono rapidamente!</div>
        </div>
      </div>
    </>
  )
}