import type { Metadata } from 'next'
import Link from 'next/link'
import { FiEdit3, FiArrowUp, FiArrowDown, FiExternalLink } from 'react-icons/fi'
import { getAllUsesAdmin } from '@/lib/uses'
import { groupByCategory } from '@/lib/uses'
import { NewUsesForm } from './NewUsesForm'
import { DeleteInlineForm } from './DeleteInlineForm'
import { reorderUsesItem } from './actions'

export const metadata: Metadata = {
  title: 'Uses',
  robots: { index: false, follow: false },
}

export default async function AdminUsesPage() {
  const items = await getAllUsesAdmin()
  const groups = groupByCategory(items)
  const categories = Object.keys(groups)

  return (
    <div>
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Uses</h1>
        <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
          {items.length} ting fordelt på {categories.length} {categories.length === 1 ? 'kategori' : 'kategorier'}
        </p>
      </header>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: '.875rem' }}>
          Ny oppføring
        </h2>
        <NewUsesForm existingCategories={categories} />
      </section>

      {categories.length === 0 ? (
        <div className="card">
          <p className="muted">Ingen oppføringer enda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {categories.map((cat) => (
            <section key={cat}>
              <h2 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, fontSize: '1.25rem', marginBottom: '.875rem' }}>{cat}</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
                  <tbody>
                    {groups[cat].map((item, i) => (
                      <tr key={item.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--rule)' }}>
                        <td style={{ padding: '.625rem .875rem', width: '1%', whiteSpace: 'nowrap' }}>
                          <form action={reorderUsesItem.bind(null, item.id, -1)} style={{ display: 'inline' }}>
                            <button type="submit" className="btn btn-sm btn-ghost" title="Opp" disabled={i === 0}>
                              <FiArrowUp />
                            </button>
                          </form>
                          <form action={reorderUsesItem.bind(null, item.id, 1)} style={{ display: 'inline' }}>
                            <button type="submit" className="btn btn-sm btn-ghost" title="Ned" disabled={i === groups[cat].length - 1}>
                              <FiArrowDown />
                            </button>
                          </form>
                        </td>
                        <td style={{ padding: '.625rem .875rem', fontWeight: 500 }}>
                          {item.name}
                          {item.description && (
                            <div className="muted" style={{ fontSize: '.8125rem', marginTop: '.125rem' }}>{item.description}</div>
                          )}
                        </td>
                        <td style={{ padding: '.625rem .875rem', width: '1%', whiteSpace: 'nowrap' }}>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" title="Åpne">
                              <FiExternalLink />
                            </a>
                          )}
                          <Link href={`/admin/uses/${item.id}`} className="btn btn-sm">
                            <FiEdit3 /> Rediger
                          </Link>
                          <DeleteInlineForm id={item.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
