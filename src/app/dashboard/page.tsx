/**
 * Dashboard Page - Account Management
 *
 * Temporary dashboard that works without Clerk authentication.
 * Once Clerk is configured, this will integrate with the Auth module.
 */

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-500">
                Vantaggio Statistico
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="/dashboard"
                className="text-yellow-500 border-b-2 border-yellow-500 pb-4 px-3 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-yellow-500 transition-colors px-3 text-sm font-medium"
              >
                Strategie
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-yellow-500 transition-colors px-3 text-sm font-medium"
              >
                Sessioni
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Utente Demo
              </div>
              <a
                href="/"
                className="bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Esci
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-yellow-500 mb-2">
            Benvenuto nel tuo Dashboard
          </h2>
          <p className="text-gray-300">
            Gestisci il tuo account e monitora le tue strategie di betting.
          </p>
        </div>

        {/* Status Alert */}
        <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-500 text-xl mr-3">🚧</span>
            <div>
              <h3 className="text-yellow-500 font-semibold">
                Piattaforma in Sviluppo
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                Week 3 completata: Auth & Permissions. Prossimi moduli: Games & Methods (Week 4-5).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Piano Attuale
            </h3>
            <p className="text-2xl font-bold text-green-400">Gratuito</p>
            <p className="text-sm text-gray-300 mt-1">
              Fibonacci + Roulette Europea
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Sessioni Oggi
            </h3>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-300 mt-1">
              Limite: 1 simultanea
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              Puntate Oggi
            </h3>
            <p className="text-2xl font-bold text-white">0 / 50</p>
            <p className="text-sm text-gray-300 mt-1">
              Limite giornaliero
            </p>
          </div>
        </div>

        {/* Available Methods */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-yellow-500/20">
          <h2 className="text-xl font-semibold text-yellow-500 mb-4">
            Metodi Disponibili
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-yellow-500/20">
              <div>
                <h3 className="font-semibold text-white">
                  Metodo Fibonacci
                </h3>
                <p className="text-sm text-gray-300">
                  Sistema di progressione basato sulla sequenza di Fibonacci
                </p>
              </div>
              <button className="bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors">
                Inizia Sessione
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 opacity-60">
              <div>
                <h3 className="font-semibold text-gray-300">
                  Metodo Martingale
                </h3>
                <p className="text-sm text-gray-400">
                  Richiede Piano Premium
                </p>
              </div>
              <button className="bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed">
                Upgrade
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 opacity-60">
              <div>
                <h3 className="font-semibold text-gray-300">
                  Metodo Paroli
                </h3>
                <p className="text-sm text-gray-400">
                  Richiede Piano Premium
                </p>
              </div>
              <button className="bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-gray-900 text-xl font-bold">👤</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-500">
                  Il Tuo Account
                </h3>
                <p className="text-gray-400 text-sm">
                  Gestisci le informazioni personali
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="bg-gray-700 px-3 py-2 rounded border border-gray-600">
                  <span className="text-gray-300">demo@vantaggiostatistico.com</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Membro da
                </label>
                <div className="bg-gray-700 px-3 py-2 rounded border border-gray-600">
                  <span className="text-gray-300">Ottobre 2024</span>
                </div>
              </div>
              <button className="w-full bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition-colors">
                Modifica Profilo
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">🔒</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-500">
                  Sicurezza
                </h3>
                <p className="text-gray-400 text-sm">
                  Proteggi il tuo account
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Password:</span>
                <span className="text-green-500">✓ Sicura</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">2FA:</span>
                <span className="text-yellow-500">Non Attiva</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ultimo Accesso:</span>
                <span className="text-gray-300">Oggi</span>
              </div>
              <button className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition-colors">
                Impostazioni Sicurezza
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-500 mb-2">
              Sblocca Tutti i Metodi
            </h2>
            <p className="text-gray-300 mb-4">
              Accedi a Martingale, Paroli, D'Alembert e altri metodi avanzati
            </p>
            <button className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors">
              Upgrade a Premium - €29/mese
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | Vantaggio Statistico',
  description: 'La tua dashboard personale con accesso a tutti i metodi di betting e le statistiche delle sessioni.',
}