/**
 * Dashboard Page - Protected Route
 *
 * Main dashboard for authenticated users.
 * Shows user's package, available methods, and quick actions.
 */

import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-casino-gold-500 mb-2">
            Dashboard
          </h1>
          <p className="text-casino-gold-200">
            Benvenuto nella tua area personale Vantaggio Statistico
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="casino-card p-6">
            <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
              Piano Attuale
            </h3>
            <p className="text-2xl font-bold text-casino-green-400">Gratuito</p>
            <p className="text-sm text-casino-gold-300 mt-1">
              Fibonacci + Roulette Europea
            </p>
          </div>

          <div className="casino-card p-6">
            <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
              Sessioni Oggi
            </h3>
            <p className="text-2xl font-bold text-casino-gold-100">0</p>
            <p className="text-sm text-casino-gold-300 mt-1">
              Limite: 1 simultanea
            </p>
          </div>

          <div className="casino-card p-6">
            <h3 className="text-lg font-semibold text-casino-gold-500 mb-2">
              Puntate Oggi
            </h3>
            <p className="text-2xl font-bold text-casino-gold-100">0 / 50</p>
            <p className="text-sm text-casino-gold-300 mt-1">
              Limite giornaliero
            </p>
          </div>
        </div>

        {/* Available Methods */}
        <div className="casino-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-casino-gold-500 mb-4">
            Metodi Disponibili
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-casino-dark-100 rounded-lg border border-casino-gold-500/20">
              <div>
                <h3 className="font-semibold text-casino-gold-100">
                  Metodo Fibonacci
                </h3>
                <p className="text-sm text-casino-gold-300">
                  Sistema di progressione basato sulla sequenza di Fibonacci
                </p>
              </div>
              <button className="btn-casino-primary">
                Inizia Sessione
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-casino-dark-200 rounded-lg border border-casino-gold-500/10 opacity-60">
              <div>
                <h3 className="font-semibold text-casino-gold-300">
                  Metodo Martingale
                </h3>
                <p className="text-sm text-casino-gold-400">
                  Richiede Piano Premium
                </p>
              </div>
              <button className="btn-casino-secondary opacity-50 cursor-not-allowed">
                Upgrade
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-casino-dark-200 rounded-lg border border-casino-gold-500/10 opacity-60">
              <div>
                <h3 className="font-semibold text-casino-gold-300">
                  Metodo Paroli
                </h3>
                <p className="text-sm text-casino-gold-400">
                  Richiede Piano Premium
                </p>
              </div>
              <button className="btn-casino-secondary opacity-50 cursor-not-allowed">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="casino-card p-6 bg-gradient-to-r from-casino-gold-500/10 to-casino-green-500/10 border-casino-gold-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-casino-gold-500 mb-2">
              Sblocca Tutti i Metodi
            </h2>
            <p className="text-casino-gold-200 mb-4">
              Accedi a Martingale, Paroli, D'Alembert e altri metodi avanzati
            </p>
            <button className="btn-casino-primary">
              Upgrade a Premium - €29/mese
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | Vantaggio Statistico',
  description: 'La tua dashboard personale con accesso a tutti i metodi di betting e le statistiche delle sessioni.',
}