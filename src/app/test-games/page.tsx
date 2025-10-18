/**
 * Test page for Games Module
 * Demonstrates the roulette game engine in action
 */

'use client'

import { useState } from 'react'
import {
  BetType,
  RouletteGameEngine,
  createEuropeanRouletteConfig,
  type BetInput,
  type SpinResult
} from '@/modules/games'

export default function TestGamesPage() {
  const [gameEngine] = useState(() => new RouletteGameEngine(createEuropeanRouletteConfig()))
  const [bets, setBets] = useState<BetInput[]>([])
  const [lastResult, setLastResult] = useState<SpinResult | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const addBet = (type: BetType, amount: number, numbers?: number[]) => {
    const newBet: BetInput = { type, amount, numbers }
    setBets([...bets, newBet])
  }

  const clearBets = () => {
    setBets([])
    setLastResult(null)
  }

  const spin = async () => {
    if (bets.length === 0) return

    setIsSpinning(true)

    // Add some delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = gameEngine.spin(bets)
    if (result.isSuccess) {
      setLastResult(result.value)
    }

    setIsSpinning(false)
  }

  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-golden-400 mb-2">
            🎰 Vantaggio Statistico - Games Module Test
          </h1>
          <p className="text-green-200">European Roulette Game Engine Demo</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Betting */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-golden-400/20 p-6">
            <h2 className="text-2xl font-bold text-golden-400 mb-4">🎯 Place Your Bets</h2>

            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => addBet(BetType.RED, 10)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                🔴 Red (€10)
              </button>
              <button
                onClick={() => addBet(BetType.BLACK, 10)}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                ⚫ Black (€10)
              </button>
              <button
                onClick={() => addBet(BetType.EVEN, 5)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                🟦 Even (€5)
              </button>
              <button
                onClick={() => addBet(BetType.ODD, 5)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                🟡 Odd (€5)
              </button>
              <button
                onClick={() => addBet(BetType.STRAIGHT, 1, [7])}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                🎯 Lucky 7 (€1)
              </button>
              <button
                onClick={() => addBet(BetType.DOZEN_1, 3)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                📊 1st Dozen (€3)
              </button>
            </div>

            {/* Current Bets */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-golden-400 mb-2">Current Bets</h3>
              {bets.length === 0 ? (
                <p className="text-green-200 italic">No bets placed yet</p>
              ) : (
                <div className="space-y-2">
                  {bets.map((bet, index) => (
                    <div key={index} className="bg-green-900/30 rounded p-3 flex justify-between items-center">
                      <span className="text-green-200">
                        {bet.type} {bet.numbers && `(${bet.numbers.join(',')})`}
                      </span>
                      <span className="text-golden-400 font-bold">€{bet.amount}</span>
                    </div>
                  ))}
                  <div className="border-t border-golden-400/20 pt-2 flex justify-between items-center font-bold">
                    <span className="text-green-200">Total Bet:</span>
                    <span className="text-golden-400">€{totalBet}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={spin}
                disabled={bets.length === 0 || isSpinning}
                className="flex-1 bg-golden-600 hover:bg-golden-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
              >
                {isSpinning ? '🎲 Spinning...' : '🎲 SPIN'}
              </button>
              <button
                onClick={clearBets}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-golden-400/20 p-6">
            <h2 className="text-2xl font-bold text-golden-400 mb-4">🎯 Results</h2>

            {lastResult ? (
              <div className="space-y-4">
                {/* Winning Number */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold ${
                    lastResult.color === 'red' ? 'bg-red-600' :
                    lastResult.color === 'black' ? 'bg-gray-800' : 'bg-green-600'
                  } text-white`}>
                    {lastResult.winningNumber}
                  </div>
                  <p className="text-green-200 mt-2">
                    Winning Number: <span className="font-bold text-golden-400">{lastResult.winningNumber}</span>
                    <br />
                    Color: <span className="font-bold">{lastResult.color.toUpperCase()}</span>
                    {lastResult.winningNumber > 0 && (
                      <>
                        <br />
                        {lastResult.isEven ? 'EVEN' : 'ODD'} • {lastResult.isLow ? 'LOW (1-18)' : 'HIGH (19-36)'}
                      </>
                    )}
                  </p>
                </div>

                {/* Bet Results */}
                <div>
                  <h3 className="text-lg font-bold text-golden-400 mb-2">Bet Results</h3>
                  <div className="space-y-2">
                    {lastResult.betResults.map((result, index) => (
                      <div key={index} className={`rounded p-3 flex justify-between items-center ${
                        result.isWinning ? 'bg-green-600/30 border border-green-400/30' : 'bg-red-600/30 border border-red-400/30'
                      }`}>
                        <span className="text-white">
                          {result.isWinning ? '✅' : '❌'} {result.bet.type}
                          {result.bet.numbers && ` (${result.bet.numbers.join(',')})`}
                        </span>
                        <span className={`font-bold ${result.isWinning ? 'text-green-400' : 'text-red-400'}`}>
                          €{result.netGain > 0 ? '+' : ''}{result.netGain}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Summary */}
                <div className="bg-golden-600/20 rounded p-4 border border-golden-400/30">
                  <h3 className="text-lg font-bold text-golden-400 mb-2">Session Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-200">Total Bet:</span>
                      <div className="font-bold text-white">€{totalBet}</div>
                    </div>
                    <div>
                      <span className="text-green-200">Total Win:</span>
                      <div className="font-bold text-green-400">€{lastResult.totalWinAmount}</div>
                    </div>
                    <div>
                      <span className="text-green-200">Net Result:</span>
                      <div className={`font-bold ${lastResult.totalNetGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        €{lastResult.totalNetGain >= 0 ? '+' : ''}{lastResult.totalNetGain}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-200">Winning Bets:</span>
                      <div className="font-bold text-white">
                        {lastResult.betResults.filter(r => r.isWinning).length}/{lastResult.betResults.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-green-200 italic py-12">
                Place some bets and spin to see results!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-green-200 text-sm">
          <p>🎰 Vantaggio Statistico Games Module - Production Ready</p>
          <p>European Roulette Engine with 37 numbers (0-36) • Real casino odds</p>
        </div>
      </div>
    </div>
  )
}

// Tailwind classes used
const styles = `
.text-golden-400 { color: #fbbf24; }
.text-golden-600 { color: #d97706; }
.bg-golden-600 { background-color: #d97706; }
.bg-golden-700 { background-color: #b45309; }
.border-golden-400 { border-color: #fbbf24; }
`