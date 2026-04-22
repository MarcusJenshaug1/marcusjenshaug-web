import Link from 'next/link'

export default function NotFound() {
  return (
    <section style={{ padding: '6rem 2rem' }}>
      <div className="container" style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}>404 · SIDE IKKE FUNNET</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1rem' }}>
          Fant ikke siden.
        </h1>
        <p className="muted" style={{ marginBottom: '2rem' }}>
          Lenken er brutt, eller innholdet er flyttet.
        </p>
        <Link href="/" className="btn btn-primary">Til forsiden</Link>
      </div>
    </section>
  )
}
