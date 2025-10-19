/**
 * Roulette Table Component
 *
 * Interactive roulette table with all possible bets:
 * - Individual numbers (0-36)
 * - Even-money bets (Red/Black, Odd/Even, High/Low)
 * - Dozens (1-12, 13-24, 25-36)
 * - Columns (1st, 2nd, 3rd)
 * - Street bets, Corner bets, etc.
 *
 * Features:
 * - Checkbox selection for manual betting methods
 * - Disabled state for fixed betting methods
 * - Heat map colors for future analytics module
 */

'use client'

import { useState } from 'react'

interface RouletteTableProps {
  sessionData: any
  selectedBets: string[]
  onBetToggle: (betType: string) => void
  disabled?: boolean
  methodId: string
}

// Definizione di tutte le puntate possibili
const ROULETTE_BETS = {
  // Numeri singoli (0-36)
  numbers: Array.from({ length: 37 }, (_, i) => ({
    id: `number_${i}`,
    label: i.toString(),
    payout: '35:1',
    type: 'straight'
  })),

  // Puntate even-money (1:1)
  evenMoney: [
    { id: 'red', label: 'Rosso', payout: '1:1', numbers: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36] },
    { id: 'black', label: 'Nero', payout: '1:1', numbers: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35] },
    { id: 'odd', label: 'Dispari', payout: '1:1', numbers: [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35] },
    { id: 'even', label: 'Pari', payout: '1:1', numbers: [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36] },
    { id: 'low', label: 'Manque (1-18)', payout: '1:1', numbers: Array.from({ length: 18 }, (_, i) => i + 1) },
    { id: 'high', label: 'Passe (19-36)', payout: '1:1', numbers: Array.from({ length: 18 }, (_, i) => i + 19) }
  ],

  // Dozzine (2:1)
  dozens: [
    { id: 'dozen_1', label: '1ª Dozzina (1-12)', payout: '2:1', numbers: Array.from({ length: 12 }, (_, i) => i + 1) },
    { id: 'dozen_2', label: '2ª Dozzina (13-24)', payout: '2:1', numbers: Array.from({ length: 12 }, (_, i) => i + 13) },
    { id: 'dozen_3', label: '3ª Dozzina (25-36)', payout: '2:1', numbers: Array.from({ length: 12 }, (_, i) => i + 25) }
  ],

  // Colonne (2:1)
  columns: [
    { id: 'column_1', label: '1ª Colonna', payout: '2:1', numbers: [1,4,7,10,13,16,19,22,25,28,31,34] },
    { id: 'column_2', label: '2ª Colonna', payout: '2:1', numbers: [2,5,8,11,14,17,20,23,26,29,32,35] },
    { id: 'column_3', label: '3ª Colonna', payout: '2:1', numbers: [3,6,9,12,15,18,21,24,27,30,33,36] }
  ]
}

// Colori dei numeri sulla roulette
const getNumberColor = (number: number): 'red' | 'black' | 'green' => {
  if (number === 0) return 'green'
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
  return redNumbers.includes(number) ? 'red' : 'black'
}

export default function RouletteTable({
  sessionData,
  selectedBets,
  onBetToggle,
  disabled = false,
  methodId
}: RouletteTableProps) {
  const [activeTab, setActiveTab] = useState<'numbers' | 'outside'>('outside')

  // Determina se il metodo permette input manuale
  // Fallback: considera fibonacci_advanced sempre manuale se il flag non è esplicitamente false
  const configManualBetInput = sessionData?.session?.config?.manualBetInput
  const isManualMethod = configManualBetInput === true ||
    (configManualBetInput !== false && methodId === 'fibonacci_advanced')
  const shouldDisable = disabled || !isManualMethod

  // Debug: mostra la configurazione
  console.log('RouletteTable Debug:', {
    methodId,
    manualBetInput: configManualBetInput,
    isManualMethod,
    shouldDisable,
    config: sessionData?.session?.config
  })

  const renderNumberGrid = () => {
    const rows = []

    // Zero separato
    rows.push(
      <div key="zero-row" className="flex justify-center mb-2">
        <div className="relative">
          <button
            className={`w-16 h-12 rounded border-2 font-bold text-white transition-all ${
              getNumberColor(0) === 'green' ? 'bg-green-600 border-green-400' : ''
            } ${shouldDisable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={shouldDisable}
          >
            0
          </button>
          {!shouldDisable && (
            <input
              type="checkbox"
              className="absolute -top-1 -right-1 w-4 h-4"
              checked={selectedBets.includes('number_0')}
              onChange={() => onBetToggle('number_0')}
            />
          )}
        </div>
      </div>
    )

    // Griglia 3x12 (numeri 1-36)
    for (let row = 0; row < 3; row++) {
      const rowNumbers = []
      for (let col = 0; col < 12; col++) {
        const number = (col * 3) + (3 - row)
        const color = getNumberColor(number)

        rowNumbers.push(
          <div key={number} className="relative">
            <button
              className={`w-12 h-12 rounded border font-bold text-white text-sm transition-all ${
                color === 'red' ? 'bg-red-600 border-red-400' :
                color === 'black' ? 'bg-gray-800 border-gray-600' :
                'bg-green-600 border-green-400'
              } ${shouldDisable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              disabled={shouldDisable}
            >
              {number}
            </button>
            {!shouldDisable && (
              <input
                type="checkbox"
                className="absolute -top-1 -right-1 w-3 h-3"
                checked={selectedBets.includes(`number_${number}`)}
                onChange={() => onBetToggle(`number_${number}`)}
              />
            )}
          </div>
        )
      }

      rows.push(
        <div key={`row-${row}`} className="flex gap-1 justify-center">
          {rowNumbers}
        </div>
      )
    }

    return <div className="space-y-1">{rows}</div>
  }

  const renderOutsideBets = () => {
    return (
      <div className="space-y-6">
        {/* Even Money Bets */}
        <div>
          <h4 className="text-lg font-semibold text-yellow-500 mb-3">Puntate Even-Money (1:1)</h4>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {ROULETTE_BETS.evenMoney.map((bet) => (
              <div key={bet.id} className="relative">
                <button
                  className={`w-full p-2 rounded border-2 font-semibold transition-all text-xs ${
                    bet.id === 'red' ? 'bg-red-500/20 border-red-500 text-red-400' :
                    bet.id === 'black' ? 'bg-gray-500/20 border-gray-500 text-gray-300' :
                    'bg-blue-500/20 border-blue-500 text-blue-400'
                  } ${shouldDisable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  disabled={shouldDisable}
                >
                  <div className="text-xs font-medium">{bet.label}</div>
                  <div className="text-xs opacity-75">{bet.payout}</div>
                </button>
                {!shouldDisable && (
                  <input
                    type="checkbox"
                    className="absolute -top-1 -right-1 w-3 h-3"
                    checked={selectedBets.includes(bet.id)}
                    onChange={() => onBetToggle(bet.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dozens */}
        <div>
          <h4 className="text-lg font-semibold text-yellow-500 mb-3">Dozzine (2:1)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ROULETTE_BETS.dozens.map((bet) => (
              <div key={bet.id} className="relative">
                <button
                  className={`w-full p-3 rounded-lg border-2 border-purple-500 bg-purple-500/20 text-purple-400 font-semibold transition-all ${
                    shouldDisable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  disabled={shouldDisable}
                >
                  <div className="text-sm">{bet.label}</div>
                  <div className="text-xs opacity-75">{bet.payout}</div>
                </button>
                {!shouldDisable && (
                  <input
                    type="checkbox"
                    className="absolute -top-1 -right-1 w-4 h-4"
                    checked={selectedBets.includes(bet.id)}
                    onChange={() => onBetToggle(bet.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div>
          <h4 className="text-lg font-semibold text-yellow-500 mb-3">Colonne (2:1)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ROULETTE_BETS.columns.map((bet) => (
              <div key={bet.id} className="relative">
                <button
                  className={`w-full p-3 rounded-lg border-2 border-orange-500 bg-orange-500/20 text-orange-400 font-semibold transition-all ${
                    shouldDisable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  disabled={shouldDisable}
                >
                  <div className="text-sm">{bet.label}</div>
                  <div className="text-xs opacity-75">{bet.payout}</div>
                </button>
                {!shouldDisable && (
                  <input
                    type="checkbox"
                    className="absolute -top-1 -right-1 w-4 h-4"
                    checked={selectedBets.includes(bet.id)}
                    onChange={() => onBetToggle(bet.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-yellow-500">🎯 Tavolo Roulette</h3>
        <div className="text-sm text-gray-400">
          {isManualMethod ? '✅ Input Manuale Attivo' : '🔒 Puntata Fissa del Metodo'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('outside')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'outside'
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Puntate Esterne
        </button>
        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'numbers'
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Numeri (0-36)
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'outside' ? renderOutsideBets() : renderNumberGrid()}
      </div>

      {/* Selected Bets Summary */}
      {selectedBets.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h4 className="text-yellow-500 font-semibold mb-2">Puntate Selezionate ({selectedBets.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedBets.map((bet) => (
              <span key={bet} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                {bet.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-400">
        {isManualMethod ? (
          <p>💡 Seleziona le caselle per scegliere su cosa puntare. Puoi combinare più puntate.</p>
        ) : (
          <p>ℹ️ Questo metodo usa una puntata fissa. La tabella mostra tutte le opzioni disponibili.</p>
        )}
      </div>
    </div>
  )
}