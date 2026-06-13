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
    <section className="error-page px-5 md:px-8">
      <div className="container" style={{ maxWidth: '40rem' }}>
        <div className="term">
          <div className="now-terminal-bar">
            <span className="now-terminal-dot" aria-hidden style={{ background: 'var(--accent)' }} />
            <span className="now-terminal-title">marcus@redi — uventet feil</span>
          </div>
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div>
              <span className="prompt">marcus@redi</span> <span className="str">~</span> $ ./kjør
            </div>
            <div className="error-code display">500</div>
            <p style={{ color: 'var(--term-ink)', margin: '0 0 1rem' }}>
              Noe gikk galt. Prøv igjen, eller gå tilbake til forsiden.
            </p>
            <button onClick={reset} className="btn-xl btn-xl-solid mono">
              Prøv igjen
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
