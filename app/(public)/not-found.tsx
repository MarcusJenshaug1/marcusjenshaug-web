import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-accent-ink font-mono font-medium mb-4">
        404
      </p>
      <h1 className="mb-4">Fant ikke siden</h1>
      <p className="text-ink-3 mb-8 max-w-md">
        Lenken er brutt, eller innholdet er flyttet. Prøv forsiden.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md bg-ink text-bg-elev hover:bg-ink-2 transition-colors"
      >
        Til forsiden
      </Link>
    </div>
  )
}
