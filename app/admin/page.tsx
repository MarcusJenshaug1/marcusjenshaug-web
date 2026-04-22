import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Logg inn',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-sunken)',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '-.02em',
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: '1.125rem', marginTop: '.875rem', fontFamily: 'var(--ff-sans)' }}>
            marcusjenshaug.no
          </h1>
          <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
            Innlogging for admin
          </p>
        </div>
        <div
          style={{
            background: 'var(--bg-elev)',
            border: '1px solid var(--rule)',
            borderRadius: '10px',
            padding: '1.5rem',
          }}
        >
          <LoginForm />
        </div>
        <Link
          href="/"
          className="dim"
          style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem', fontSize: '.8125rem' }}
        >
          ← Tilbake til siden
        </Link>
      </div>
    </div>
  )
}
