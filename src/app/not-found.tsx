export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-casino-gold-500 mb-4">404</h1>
        <p className="text-casino-gold-200 mb-8">Pagina non trovata</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-casino-gold-500 text-casino-dark-50 rounded-lg hover:bg-casino-gold-400 transition-colors"
        >
          Torna alla Home
        </a>
      </div>
    </div>
  )
}