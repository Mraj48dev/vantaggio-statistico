/**
 * Sign In Page - Clerk Authentication
 *
 * Custom sign-in page with casino theme styling.
 * Integrates with our Auth module for user sync.
 */

// import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">
            Accedi
          </h1>
          <p className="text-gray-300">
            Accedi al tuo account Vantaggio Statistico
          </p>
        </div>

        {/* Temporary: Clerk Sign In Component disabled until env vars configured */}
        <div className="flex justify-center bg-gray-800 p-8 rounded-lg border border-yellow-500/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">
              🚧 Autenticazione in configurazione
            </h2>
            <p className="text-gray-300 mb-4">
              Il sistema di autenticazione è temporaneamente disabilitato durante la configurazione delle variabili d'ambiente.
            </p>
            <a
              href="/"
              className="bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Torna alla Home
            </a>
          </div>
        </div>

        {/* Responsible Gambling Notice */}
        <div className="text-center text-sm text-gray-400 border-t border-yellow-500/20 pt-6">
          <p className="mb-2">
            🔞 <strong>Solo per maggiorenni</strong> - Gioco responsabile
          </p>
          <p className="text-xs">
            Il gioco può causare dipendenza. Gioca responsabilmente.
            <br />
            <a href="#" className="text-yellow-500 hover:underline">
              Risorse per il gioco responsabile
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Accedi | Vantaggio Statistico',
  description: 'Accedi al tuo account Vantaggio Statistico per iniziare a utilizzare le strategie di betting avanzate.',
}