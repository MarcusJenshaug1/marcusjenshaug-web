import type { Metadata } from 'next'
import { getNowEntries } from '@/lib/now'
import { SafeMdx } from '@/components/SafeMdx'
import { Reveal } from '@/components/motion/Reveal'
import { OsloTerminalLine } from '@/components/OsloTerminal'

export const metadata: Metadata = {
  title: 'Nå',
  description: 'Hva Marcus Jenshaug jobber med akkurat nå.',
  alternates: { canonical: '/na' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function NaPage() {
  const entries = await getNowEntries()

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container" style={{ maxWidth: '52rem' }}>
        <div className="page-head">
          <div className="eyebrow">
            /NA · NOW-PAGE ·{' '}
            <a href="https://nownownow.com" className="link" style={{ color: 'inherit' }}>
              nownownow.com
            </a>
          </div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">Hva jeg jobber med akkurat nå</h1>
          </Reveal>
          <p className="page-lede">
            Dette er ikke en blogg. Det er en logg — korte oppdateringer om hva som opptar meg
            akkurat nå. Inspirert av Derek Sivers sin <code className="inline-code">/now</code>
            -konvensjon.
          </p>
        </div>

        <div className="term now-terminal na-log">
          <div className="now-terminal-bar">
            <span className="now-terminal-dot" aria-hidden />
            <span className="now-terminal-title">marcus@redi — ~/na — git log</span>
          </div>
          <OsloTerminalLine />
          <div>
            <span className="prompt">marcus@redi</span> <span className="str">~/na</span> $ git
            log --reverse=false
          </div>
          {entries.length === 0 ? (
            <p className="com" style={{ marginTop: '1rem' }}>
              # Første oppdatering kommer snart.
            </p>
          ) : (
            entries.map((e, i) => (
              <article key={e.id} className={`na-entry${i === 0 ? ' na-entry-latest' : ''}`}>
                <div className="na-entry-head">
                  <span className="str">commit</span>{' '}
                  <time dateTime={e.published_at} className="na-entry-date">
                    {formatDate(e.published_at)}
                  </time>
                  {i === 0 && <span className="na-entry-badge">HEAD → nå</span>}
                </div>
                <div className="now-terminal-content">
                  <SafeMdx source={e.content} />
                </div>
              </article>
            ))
          )}
          <div>
            <span className="prompt">marcus@redi</span> <span className="str">~/na</span> ${' '}
            <span className="term-caret" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  )
}
