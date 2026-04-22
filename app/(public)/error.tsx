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
    <section style={{ padding: '6rem 2rem' }}>
      <div className="container" style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}>ERROR · UVENTET FEIL</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1rem' }}>
          Noe gikk galt.
        </h1>
        <p className="muted" style={{ marginBottom: '2rem' }}>
          En uventet feil oppsto. Prøv igjen, eller gå tilbake til forsiden.
        </p>
        <button onClick={reset} className="btn btn-primary">Prøv igjen</button>
      </div>
    </section>
  )
}
