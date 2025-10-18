/**
 * Method Configuration Modal Component
 *
 * Modal component for configuring betting method parameters.
 * Shows method explanation, configuration form, and loss progression table.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { LossProgression } from '@/modules/methods'

interface MethodConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: MethodConfig) => void
  method: {
    id: string
    displayName: string
    explanation: string
    configSchema: {
      fields: Record<string, FieldSchema>
    }
    defaultConfig: Record<string, any>
  }
}

interface MethodConfig {
  baseBet: number
  stopLoss: number
}

interface FieldSchema {
  type: string
  label: string
  description: string
  min?: number
  max?: number
  default?: any
  placeholder?: string
}

export function MethodConfigurationModal({
  isOpen,
  onClose,
  onConfirm,
  method
}: MethodConfigurationModalProps) {
  const [config, setConfig] = useState<MethodConfig>({
    baseBet: method.defaultConfig.baseBet || 10,
    stopLoss: method.defaultConfig.stopLoss || 100
  })
  const [lossProgression, setLossProgression] = useState<LossProgression[]>([])
  const [showProgression, setShowProgression] = useState(false)

  // Calculate loss progression when base bet changes
  useEffect(() => {
    if (config.baseBet > 0) {
      calculateLossProgression(config.baseBet)
    }
  }, [config.baseBet])

  const calculateLossProgression = (baseBet: number) => {
    // Fibonacci sequence for first 10 steps
    const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
    const progression: LossProgression[] = []
    let totalLoss = 0

    for (let i = 0; i < fibSequence.length; i++) {
      const multiplier = fibSequence[i]
      const betAmount = baseBet * multiplier
      totalLoss += betAmount

      progression.push({
        step: i + 1,
        multiplier,
        betAmount,
        cumulativeLoss: totalLoss
      })
    }

    setLossProgression(progression)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(config)
  }

  const handleFieldChange = (field: keyof MethodConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getRecommendedBankroll = () => {
    const totalLoss = lossProgression[lossProgression.length - 1]?.cumulativeLoss || 0
    return totalLoss * 2 // Conservative recommendation
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-500">
            Configura {method.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Method Info & Form */}
          <div>
            {/* Method Explanation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-yellow-500 mb-3">
                Come Funziona
              </h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-300 text-sm whitespace-pre-line">
                  {method.explanation}
                </div>
              </div>
            </div>

            {/* Configuration Form */}
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">
                Configurazione
              </h3>

              {/* Base Bet Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {method.configSchema.fields.baseBet?.label}
                </label>
                <input
                  type="number"
                  value={config.baseBet}
                  onChange={(e) => handleFieldChange('baseBet', Number(e.target.value))}
                  min={method.configSchema.fields.baseBet?.min || 1}
                  max={method.configSchema.fields.baseBet?.max || 1000}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder={method.configSchema.fields.baseBet?.placeholder}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {method.configSchema.fields.baseBet?.description}
                </p>
              </div>

              {/* Stop Loss Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {method.configSchema.fields.stopLoss?.label}
                </label>
                <input
                  type="number"
                  value={config.stopLoss}
                  onChange={(e) => handleFieldChange('stopLoss', Number(e.target.value))}
                  min={method.configSchema.fields.stopLoss?.min || 10}
                  max={method.configSchema.fields.stopLoss?.max || 10000}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder={method.configSchema.fields.stopLoss?.placeholder}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {method.configSchema.fields.stopLoss?.description}
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h4 className="text-blue-400 font-semibold mb-2">💡 Raccomandazioni</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Bankroll raccomandato: <span className="font-semibold text-white">{formatCurrency(getRecommendedBankroll())}</span></p>
                  <p>• Stop Loss consigliato: <span className="font-semibold text-white">{formatCurrency(config.baseBet * 50)}</span></p>
                  <p>• Puntata base: Non superare il 2% del tuo bankroll</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded hover:bg-gray-500 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded hover:bg-yellow-400 transition-colors"
                >
                  Conferma Configurazione
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Loss Progression */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-500">
                Prospetto Perdite
              </h3>
              <button
                onClick={() => setShowProgression(!showProgression)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {showProgression ? 'Nascondi' : 'Mostra'} dettagli
              </button>
            </div>

            {showProgression && (
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-600 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-300">Passo</th>
                        <th className="px-3 py-2 text-left text-gray-300">Moltiplicatore</th>
                        <th className="px-3 py-2 text-right text-gray-300">Puntata</th>
                        <th className="px-3 py-2 text-right text-gray-300">Perdita Tot.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lossProgression.map((step, index) => (
                        <tr
                          key={step.step}
                          className={`${
                            index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'
                          } ${
                            step.cumulativeLoss > config.stopLoss
                              ? 'bg-red-500/20 border-l-2 border-red-500'
                              : ''
                          }`}
                        >
                          <td className="px-3 py-2 text-gray-300">{step.step}</td>
                          <td className="px-3 py-2 text-gray-300">{step.multiplier}x</td>
                          <td className="px-3 py-2 text-right text-white font-medium">
                            {formatCurrency(step.betAmount)}
                          </td>
                          <td className={`px-3 py-2 text-right font-medium ${
                            step.cumulativeLoss > config.stopLoss
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }`}>
                            {formatCurrency(step.cumulativeLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stop Loss Warning */}
                {lossProgression.some(step => step.cumulativeLoss > config.stopLoss) && (
                  <div className="bg-red-500/10 border-t border-red-500/30 p-3">
                    <p className="text-red-400 text-xs">
                      ⚠️ Le righe evidenziate superano il tuo stop loss di {formatCurrency(config.stopLoss)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Perdita Max (10 passi)</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(lossProgression[lossProgression.length - 1]?.cumulativeLoss || 0)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Passi prima Stop Loss</p>
                <p className="text-lg font-semibold text-white">
                  {lossProgression.findIndex(step => step.cumulativeLoss > config.stopLoss) + 1 || 10}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}