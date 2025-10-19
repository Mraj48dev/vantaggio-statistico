'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold mb-4">Qualcosa è andato storto</h1>
        <p className="text-gray-300 mb-6">
          Si è verificato un errore inaspettato.
        </p>
        <button
          onClick={reset}
          className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors mr-4"
        >
          Riprova
        </button>
        <a
          href="/dashboard"
          className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Torna al Dashboard
        </a>
      </div>
    </div>
  )
}