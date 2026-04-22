import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uses',
  description: 'Verktøy, programvare og hardware Marcus Jenshaug bruker.',
  alternates: { canonical: '/uses' },
}

export default function UsesPage() {
  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '48rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>/USES · SETUP</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500 }}>
          Verktøy, programvare og hardware jeg faktisk bruker.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '34rem' }}>
          Inspirert av <a href="https://usesthis.com" className="link">usesthis.com</a>. Jeg prøver å holde dette ærlig: kun ting jeg bruker daglig eller ukentlig.
        </p>
        <div className="card" style={{ marginTop: '2rem' }}>
          <p className="muted">Liste kommer snart.</p>
        </div>
      </div>
    </section>
  )
}
