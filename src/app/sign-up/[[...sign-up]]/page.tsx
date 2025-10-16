/**
 * Sign Up Page - Clerk Authentication
 *
 * Custom sign-up page with casino theme styling.
 * New users are automatically assigned the free package.
 */

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-casino-gold-500 mb-2">
            Registrati
          </h1>
          <p className="text-casino-gold-200">
            Inizia il tuo percorso con le strategie statistiche
          </p>
        </div>

        {/* Free Package Benefits */}
        <div className="casino-card p-4 mb-6">
          <h3 className="text-lg font-semibold text-casino-gold-500 mb-3">
            Piano Gratuito Incluso
          </h3>
          <ul className="space-y-2 text-sm text-casino-gold-200">
            <li className="flex items-center">
              <span className="text-casino-green-400 mr-2">✓</span>
              Accesso al Metodo Fibonacci
            </li>
            <li className="flex items-center">
              <span className="text-casino-green-400 mr-2">✓</span>
              Roulette Europea
            </li>
            <li className="flex items-center">
              <span className="text-casino-green-400 mr-2">✓</span>
              1 sessione simultanea
            </li>
            <li className="flex items-center">
              <span className="text-casino-green-400 mr-2">✓</span>
              50 puntate al giorno
            </li>
          </ul>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            redirectUrl="/dashboard"
          />
        </div>

        {/* Terms and Responsible Gambling */}
        <div className="text-center text-sm text-casino-gold-300 border-t border-casino-gold-500/20 pt-6">
          <p className="mb-2">
            🔞 <strong>Solo per maggiorenni</strong> - Gioco responsabile
          </p>
          <p className="text-xs mb-3">
            Registrandoti accetti i nostri{' '}
            <a href="#" className="text-casino-gold-500 hover:underline">
              Termini di Servizio
            </a>{' '}
            e la{' '}
            <a href="#" className="text-casino-gold-500 hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs">
            Il gioco può causare dipendenza. Gioca responsabilmente.
            <br />
            <a href="#" className="text-casino-gold-500 hover:underline">
              Risorse per il gioco responsabile
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Registrati | Vantaggio Statistico',
  description: 'Crea il tuo account gratuito e inizia subito con il Metodo Fibonacci per la Roulette Europea.',
}