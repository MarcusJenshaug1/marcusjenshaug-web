import type { Metadata } from 'next'
import Link from 'next/link'
import { FiEdit3 } from 'react-icons/fi'
import { getAllNowAdmin } from '@/lib/now'
import { NewNowForm } from './NewNowForm'
import { DeleteInlineForm } from './DeleteInlineForm'

export const metadata: Metadata = {
  title: 'Nå',
  robots: { index: false, follow: false },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('nb-NO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminNaPage() {
  const entries = await getAllNowAdmin()

  return (
    <div>
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Nå</h1>
        <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
          {entries.length} oppføringer · publiseres direkte, ingen utkast
        </p>
      </header>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: '.875rem' }}>
          Ny oppføring
        </h2>
        <NewNowForm />
      </section>

      {entries.length === 0 ? (
        <div className="card">
          <p className="muted">Ingen oppføringer enda.</p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: '.875rem' }}>
            Tidligere
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {entries.map((e) => (
              <div key={e.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.5rem' }}>
                  <span className="mono dim" style={{ fontSize: '.75rem' }}>{formatDate(e.published_at)}</span>
                  <div style={{ display: 'flex', gap: '.375rem' }}>
                    <Link href={`/admin/na/${e.id}`} className="btn btn-sm btn-ghost">
                      <FiEdit3 /> Rediger
                    </Link>
                    <DeleteInlineForm id={e.id} />
                  </div>
                </div>
                <p style={{ fontSize: '.9375rem', color: 'var(--ink-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {e.content.slice(0, 280)}{e.content.length > 280 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
