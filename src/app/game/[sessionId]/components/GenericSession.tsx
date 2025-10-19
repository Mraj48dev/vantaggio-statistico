/**
 * Generic Session Component
 *
 * Reusable component for methods that use standard even-money betting:
 * - Paroli, D'Alembert, Labouchere, etc.
 * - Even-money betting with configurable target
 * - Automatic bet calculation
 */

'use client'

import { useState } from 'react'
import RouletteTable from './RouletteTable'

interface GenericSessionProps {
  sessionData: any
  nextBetSuggestion: any
  onSubmitResult: (number: number, amount?: number, selectedBets?: string[]) => void
  processing: boolean
  lastResult: number | null
  getNumberColor: (number: number) => string
  methodDisplayName: string
  primaryColor?: string
  borderColor?: string
}

export default function GenericSession({
  sessionData,
  nextBetSuggestion,
  onSubmitResult,
  processing,
  lastResult,
  getNumberColor,
  methodDisplayName,
  primaryColor = 'blue-500',
  borderColor = 'blue-500'
}: GenericSessionProps) {
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
        <div className={`mb-8 bg-gradient-to-r from-${primaryColor}/20 to-${primaryColor}/30 border-2 border-${borderColor} rounded-xl p-6`}>
          <div className="text-center">
            <div className={`text-${primaryColor} font-bold text-lg mb-2`}>🎯 PROSSIMA PUNTATA {methodDisplayName.toUpperCase()}</div>
            <div className="text-4xl font-bold text-white mb-2">€{nextBetSuggestion.amount}</div>
            <div className={`text-lg text-${primaryColor} font-semibold mb-2`}>{targetDesc} (Paga 1:1)</div>
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
        methodId={methodDisplayName}
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
            className={`w-24 h-12 text-center text-2xl font-bold bg-gray-700 border-2 border-${borderColor} rounded-lg text-white`}
            placeholder="?"
            disabled={processing || !nextBetSuggestion?.shouldBet}
          />
          <button
            onClick={handleSubmit}
            disabled={processing || !inputNumber || !nextBetSuggestion?.shouldBet}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing || !inputNumber || !nextBetSuggestion?.shouldBet
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : `bg-${primaryColor} text-white hover:bg-${primaryColor.replace('500', '400')}`
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
      <div className={`text-sm text-gray-400 bg-${primaryColor}/10 border border-${borderColor}/30 rounded-lg p-4`}>
        <div className={`font-semibold text-${primaryColor} mb-2`}>📋 Come funziona ({methodDisplayName}):</div>
        <div className="space-y-1">
          <div>1. Gioca alla roulette con la puntata suggerita</div>
          <div>2. Punta sempre su <strong>{targetDesc}</strong> (puntata even-money 1:1)</div>
          <div>3. Inserisci il numero che è uscito (0-36)</div>
          <div>4. Il sistema calcolerà automaticamente la prossima puntata</div>
          <div>5. Segui la strategia del metodo {methodDisplayName}</div>
        </div>
      </div>
    </>
  )
}