/**
 * Demo Page - Accesso diretto senza autenticazione
 */

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-yellow-500/20 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">🎯 Vantaggio Statistico</h1>
              <p className="text-sm text-gray-300">Modalità Demo</p>
            </div>
            <div className="text-sm text-gray-400">
              Demo senza autenticazione
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🎲 Benvenuto nella Demo</h2>
            <p className="text-gray-300 mb-6">
              Esplora la piattaforma di casino con strategia Fibonacci integrata
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dashboard Demo */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-yellow-500 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Dashboard</h3>
              <p className="text-gray-300 mb-4">
                Configura e avvia sessioni di gioco con metodi statistici avanzati
              </p>
              <a
                href="/dashboard"
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
              >
                Vai al Dashboard
              </a>
            </div>

            {/* Features */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-green-500 text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-3">Funzionalità</h3>
              <ul className="text-gray-300 space-y-2 mb-4">
                <li>✅ Metodo Fibonacci</li>
                <li>✅ Roulette Europea</li>
                <li>✅ Sessioni Live</li>
                <li>✅ Calcolo automatico puntate</li>
              </ul>
            </div>

            {/* Quick Start */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Avvio Rapido</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li>1. Vai al Dashboard</li>
                <li>2. Seleziona Roulette Europea</li>
                <li>3. Scegli Metodo Fibonacci</li>
                <li>4. Configura puntata base</li>
                <li>5. Inizia sessione live</li>
              </ol>
            </div>

            {/* Tech Stack */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-purple-500 text-3xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-3">Tecnologie</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Next.js 15 + TypeScript</li>
                <li>• Clean Architecture</li>
                <li>• Prisma + PostgreSQL</li>
                <li>• Moduli Domain-Driven</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Questa è una demo funzionale del sistema. Tutte le funzionalità sono operative.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}