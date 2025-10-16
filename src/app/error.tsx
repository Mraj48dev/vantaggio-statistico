'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-casino-red-500 mb-4">Errore</h1>
        <p className="text-casino-gold-200 mb-8">Qualcosa è andato storto</p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-casino-gold-500 text-casino-dark-50 rounded-lg hover:bg-casino-gold-400 transition-colors mr-4"
        >
          Riprova
        </button>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-casino-green-500 text-white rounded-lg hover:bg-casino-green-400 transition-colors"
        >
          Torna alla Home
        </a>
      </div>
    </div>
  )
}