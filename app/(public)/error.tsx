'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-accent-ink font-mono font-medium mb-4">
        Feil
      </p>
      <h1 className="mb-4">Noe gikk galt</h1>
      <p className="text-ink-3 mb-8 max-w-md">
        En uventet feil oppsto. Prøv igjen, eller gå tilbake til forsiden.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md bg-ink text-bg-elev hover:bg-ink-2 transition-colors"
      >
        Prøv igjen
      </button>
    </div>
  )
}
