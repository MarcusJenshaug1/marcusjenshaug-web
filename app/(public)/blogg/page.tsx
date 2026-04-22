import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogg',
  description: 'Notater og lengre stykker om koden jeg skriver.',
  alternates: { canonical: '/blogg' },
}

export default function BloggPage() {
  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '52rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>ARTICLE · ARKIV</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, maxWidth: '28rem' }}>
          Notater og lengre stykker om koden jeg skriver.
        </h1>
        <div className="card" style={{ marginTop: '2rem' }}>
          <p className="muted">Første innlegg kommer snart.</p>
        </div>
      </div>
    </section>
  )
}
