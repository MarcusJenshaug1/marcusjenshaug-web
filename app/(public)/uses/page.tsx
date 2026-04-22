import type { Metadata } from 'next'
import { FiExternalLink } from 'react-icons/fi'
import { getUsesItems, groupByCategory } from '@/lib/uses'

export const metadata: Metadata = {
  title: 'Uses',
  description: 'Verktøy, programvare og hardware Marcus Jenshaug bruker.',
  alternates: { canonical: '/uses' },
}

export default async function UsesPage() {
  const items = await getUsesItems()
  const groups = groupByCategory(items)
  const categories = Object.keys(groups)

  return (
    <section className="px-5 py-10 md:px-8 md:py-12">
      <div className="container" style={{ maxWidth: '48rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>/USES · SETUP</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500 }}>
          Verktøy, programvare og hardware jeg faktisk bruker.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '34rem' }}>
          Inspirert av <a href="https://usesthis.com" className="link">usesthis.com</a>. Jeg prøver å holde dette ærlig: kun ting jeg bruker daglig eller ukentlig.
        </p>

        {categories.length === 0 ? (
          <div className="card" style={{ marginTop: '2rem' }}>
            <p className="muted">Liste kommer snart.</p>
          </div>
        ) : (
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {categories.map((cat) => (
              <section key={cat}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.75rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, fontSize: '1.5rem' }}>{cat}</h2>
                  <span className="mono dim" style={{ fontSize: '.75rem' }}>· {groups[cat].length}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                  {groups[cat].map((it) => (
                    <li
                      key={it.id}
                      className="grid gap-x-4 gap-y-1 py-3 items-baseline border-t border-rule grid-cols-[1fr_auto] md:grid-cols-[14rem_1fr_auto]"
                    >
                      <div style={{ fontWeight: 500 }}>{it.name}</div>
                      <div
                        className="muted col-span-2 md:col-span-1 md:order-none order-last"
                        style={{ fontSize: '.9375rem' }}
                      >
                        {it.description ?? ''}
                      </div>
                      {it.url ? (
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="dim" style={{ fontSize: '.8125rem' }}>
                          <FiExternalLink />
                        </a>
                      ) : (
                        <span />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
