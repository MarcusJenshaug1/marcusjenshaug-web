import type { Metadata } from 'next'
import Link from 'next/link'
import { FiPlus, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi'
import { getAllPostsAdmin } from '@/lib/posts'
import { togglePublish } from './actions'

export const metadata: Metadata = {
  title: 'Blogg',
  robots: { index: false, follow: false },
}

export default async function AdminBloggPage() {
  const posts = await getAllPostsAdmin()

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>Blogg</h1>
          <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
            {posts.length} totalt · {posts.filter((p) => p.draft).length} utkast
          </p>
        </div>
        <Link href="/admin/blogg/ny" className="btn btn-primary btn-sm">
          <FiPlus /> Nytt innlegg
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="card">
          <p className="muted">Ingen innlegg enda. <Link href="/admin/blogg/ny" className="link">Skriv det første</Link>.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sunken)' }}>
                <Th>Tittel</Th>
                <Th>Tags</Th>
                <Th>Synlighet</Th>
                <Th>Publisert</Th>
                <Th style={{ width: '1%', whiteSpace: 'nowrap' }}>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--rule)' }}>
                  <Td>
                    <Link href={`/admin/blogg/${p.id}`} style={{ fontWeight: 500 }}>{p.title}</Link>
                    <div className="dim mono" style={{ fontSize: '.75rem', marginTop: '.125rem' }}>/{p.slug}</div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>
                      {p.tags.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}
                    </div>
                  </Td>
                  <Td>
                    <form action={togglePublish.bind(null, p.id, p.draft)} style={{ display: 'inline' }}>
                      <button type="submit" className="btn btn-sm btn-ghost" title={p.draft ? 'Publiser' : 'Avpubliser'}>
                        {p.draft ? <><FiEyeOff /> Utkast</> : <><FiEye /> Publisert</>}
                      </button>
                    </form>
                  </Td>
                  <Td>
                    <span className="mono dim" style={{ fontSize: '.75rem' }}>
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </Td>
                  <Td>
                    <Link href={`/admin/blogg/${p.id}`} className="btn btn-sm">
                      <FiEdit3 /> Rediger
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '.625rem .875rem', textAlign: 'left', fontSize: '.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)', ...style }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '.75rem .875rem', ...style }}>{children}</td>
}
