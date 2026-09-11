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
    <div className="card" style={{ maxWidth: '40rem' }}>
      <h1 style={{ fontSize: '1.375rem', marginBottom: '.5rem' }}>Noe gikk galt</h1>
      <p className="muted" style={{ fontSize: '.9375rem', marginBottom: '1.25rem' }}>
        Handlingen kunne ikke fullføres. Prøv igjen, eller last siden på nytt.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Prøv igjen
      </button>
    </div>
  )
}
