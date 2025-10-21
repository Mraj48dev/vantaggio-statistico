/**
 * Custom 404 Not Found Page
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-yellow-500 text-6xl mb-4">🎲</div>
        <h1 className="text-4xl font-bold mb-4">404 - Pagina Non Trovata</h1>
        <p className="text-gray-300 mb-6">
          La pagina che stai cercando non esiste.
        </p>
        <a
          href="/dashboard"
          className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Torna al Dashboard
        </a>
      </div>
    </div>
  )
}