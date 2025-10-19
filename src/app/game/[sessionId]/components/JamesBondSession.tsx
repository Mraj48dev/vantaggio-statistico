/**
 * James Bond Session Component
 *
 * Specialized component for James Bond method with:
 * - Multiple simultaneous bets (High, Six Line, Zero)
 * - Fixed bet ratios
 * - Coverage display
 */

'use client'

import { useState } from 'react'
import RouletteTable from './RouletteTable'

interface JamesBondSessionProps {
  sessionData: any
  nextBetSuggestion: any
  onSubmitResult: (number: number) => void
  processing: boolean
  lastResult: number | null
  getNumberColor: (number: number) => string
}

export default function JamesBondSession({
  sessionData,
  nextBetSuggestion,
  onSubmitResult,
  processing,
  lastResult,
  getNumberColor
}: JamesBondSessionProps) {
  const [inputNumber, setInputNumber] = useState<string>('')
  const [selectedBets, setSelectedBets] = useState<string[]>([])

  const handleBetToggle = (betType: string) => {
    setSelectedBets(prev =>
      prev.includes(betType)
        ? prev.filter(bet => bet !== betType)
        : [...prev, betType]
    )
  }

  const unitSize = sessionData?.session?.config?.unitSize || 0.5
  const highBet = 140 * unitSize
  const sixLineBet = 50 * unitSize
  const zeroBet = 10 * unitSize
  const totalBet = 200 * unitSize

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

    onSubmitResult(number)

    // Clear input for next round
    setInputNumber('')
  }

  return (
    <>
      {/* Current Bet Suggestion - PROMINENT */}
      {nextBetSuggestion && nextBetSuggestion.shouldBet && (
        <div className="mb-8 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-500 rounded-xl p-6">
          <div className="text-center">
            <div className="text-purple-500 font-bold text-lg mb-2">🎯 PUNTATE MULTIPLE JAMES BOND</div>
            <div className="text-4xl font-bold text-white mb-3">€{totalBet}</div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                <div className="text-purple-400 font-semibold">High (19-36)</div>
                <div className="text-white">€{highBet}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <div className="text-blue-400 font-semibold">Six Line (13-18)</div>
                <div className="text-white">€{sixLineBet}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                <div className="text-green-400 font-semibold">Zero</div>
                <div className="text-white">€{zeroBet}</div>
              </div>
            </div>

            <div className="text-sm text-gray-300">
              Copertura: 25/37 numeri (67.6%) • {nextBetSuggestion.reason}
            </div>
          </div>
        </div>
      )}

      {/* Roulette Table */}
      <RouletteTable
        sessionData={sessionData}
        selectedBets={selectedBets}
        onBetToggle={handleBetToggle}
        disabled={processing}
        methodId="james_bond"
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
            className="w-24 h-12 text-center text-2xl font-bold bg-gray-700 border-2 border-purple-500 rounded-lg text-white"
            placeholder="?"
            disabled={processing || !nextBetSuggestion?.shouldBet}
          />
          <button
            onClick={handleSubmit}
            disabled={processing || !inputNumber || !nextBetSuggestion?.shouldBet}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing || !inputNumber || !nextBetSuggestion?.shouldBet
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-400'
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

          {/* Coverage indicator */}
          <div className="mt-2 text-sm">
            {lastResult === 0 && <span className="text-green-400">✅ Zero coperto (+€{zeroBet * 35})</span>}
            {lastResult >= 1 && lastResult <= 12 && <span className="text-red-400">❌ Non coperto (-€{totalBet})</span>}
            {lastResult >= 13 && lastResult <= 18 && <span className="text-blue-400">✅ Six Line coperto (+€{sixLineBet * 5})</span>}
            {lastResult >= 19 && lastResult <= 36 && <span className="text-purple-400">✅ High coperto (+€{highBet})</span>}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-400 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="font-semibold text-purple-400 mb-2">📋 Come funziona (James Bond):</div>
        <div className="space-y-1">
          <div>1. Piazza 3 puntate simultanee con gli importi mostrati</div>
          <div>2. <strong>€{highBet} su High (19-36)</strong> - Paga 1:1</div>
          <div>3. <strong>€{sixLineBet} su Six Line (13-18)</strong> - Paga 5:1</div>
          <div>4. <strong>€{zeroBet} su Zero</strong> - Paga 35:1</div>
          <div>5. Inserisci il numero che è uscito</div>
          <div className="text-purple-300">💡 Strategia fissa: sempre gli stessi importi!</div>
        </div>
      </div>
    </>
  )
}