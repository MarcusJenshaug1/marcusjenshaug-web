import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prosjekter',
  description: 'Portefølje og prosjekter av Marcus Jenshaug.',
  alternates: { canonical: '/prosjekter' },
}

export default function ProsjekterPage() {
  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>CREATIVEWORK · ARKIV</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, maxWidth: '32rem' }}>
          Prosjekter, fra klientarbeid til sidesysler.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '32rem' }}>
          Et utvalg ting jeg har designet, bygget eller hjulpet med å flytte framover.
        </p>
        <div className="card" style={{ marginTop: '2rem' }}>
          <p className="muted">Kommer snart.</p>
        </div>
      </div>
    </section>
  )
}
