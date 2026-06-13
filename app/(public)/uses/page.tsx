import type { Metadata } from 'next'
import { FiArrowUpRight } from 'react-icons/fi'
import { getUsesItems, groupByCategory } from '@/lib/uses'
import { Reveal } from '@/components/motion/Reveal'

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
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">/USES · SETUP · {String(items.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">
              Verktøy, programvare og hardware jeg faktisk bruker
            </h1>
          </Reveal>
          <p className="page-lede">
            Inspirert av{' '}
            <a href="https://usesthis.com" className="link">
              usesthis.com
            </a>
            . Jeg prøver å holde dette ærlig: kun ting jeg bruker daglig eller ukentlig.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="muted">Liste kommer snart.</p>
        ) : (
          <div className="uses-layout">
            <nav className="uses-rail mono" aria-label="Kategorier">
              {categories.map((cat, i) => (
                <a key={cat} href={`#uses-${i}`} className="uses-rail-link">
                  <span className="uses-rail-index">{String(i + 1).padStart(2, '0')}</span>
                  {cat}
                  <span className="uses-rail-count">{groups[cat].length}</span>
                </a>
              ))}
            </nav>
            <div className="uses-groups">
              {categories.map((cat, i) => (
                <section key={cat} id={`uses-${i}`} className="uses-group">
                  <div className="uses-group-head">
                    <h2 className="display display-3">{cat}</h2>
                    <span className="mono dim uses-group-count">
                      {String(groups[cat].length).padStart(2, '0')}
                    </span>
                  </div>
                  <ul className="uses-table">
                    {groups[cat].map((it) => {
                      const inner = (
                        <>
                          <span className="uses-item-name">{it.name}</span>
                          <span className="uses-item-desc">{it.description ?? ''}</span>
                          {it.url && <FiArrowUpRight aria-hidden className="uses-item-arrow" />}
                        </>
                      )
                      return (
                        <li key={it.id}>
                          {it.url ? (
                            <a
                              href={it.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="uses-item"
                            >
                              {inner}
                            </a>
                          ) : (
                            <span className="uses-item">{inner}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
