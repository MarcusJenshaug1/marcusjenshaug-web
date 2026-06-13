import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import { getFeaturedProjects } from '@/lib/projects'
import { getLatestPosts } from '@/lib/posts'
import { getLatestNowEntry } from '@/lib/now'
import { readingTime } from '@/lib/mdx'
import { SafeMdx } from '@/components/SafeMdx'
import { OsloTerminal } from '@/components/OsloTerminal'
import { ProjectCard } from '@/components/ProjectCard'
import { Hero } from '@/components/home/Hero'
import { IntroOverlay } from '@/components/home/IntroOverlay'
import { FiClock } from 'react-icons/fi'

export default async function HomePage() {
  const [s, featured, posts, latestNow] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getLatestPosts(4),
    getLatestNowEntry(),
  ])

  return (
    <>
      <IntroOverlay name={s.full_name} />
      <Hero settings={s} />

      <section className="px-5 py-10 md:px-8 md:py-10" data-section="prosjekter">
        <div className="container">
          <div className="section-head">
            <h2>Utvalgte prosjekter</h2>
            <Link href="/prosjekter" className="muted" style={{ fontSize: '.8125rem' }}>Alle prosjekter →</Link>
          </div>
          {featured.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>Kommer snart.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {featured.slice(0, 3).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <hr className="rule container" />

      <section className="px-5 py-10 md:px-8 md:py-10" data-section="notater">
        <div className="container grid gap-8 md:gap-12 grid-cols-1 md:grid-cols-2">
          <div>
            <div className="section-head">
              <h2>Siste notater</h2>
              <Link href="/blogg" className="muted" style={{ fontSize: '.8125rem' }}>Alle →</Link>
            </div>
            {posts.length === 0 ? (
              <p className="muted" style={{ fontSize: '.9375rem' }}>Kommer snart.</p>
            ) : (
              <div>
                {posts.map((p) => (
                  <Link key={p.id} href={`/blogg/${p.slug}`} className="post-row">
                    <div>
                      <div className="post-title">{p.title}</div>
                      <div className="post-desc">{p.description}</div>
                      <div style={{ display: 'flex', gap: '.375rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                        {p.tags.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
                        <span className="chip"><FiClock /> {readingTime(p.content)} min</span>
                      </div>
                    </div>
                    <span className="post-date">
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="section-head">
              <h2>Akkurat nå</h2>
              <Link href="/na" className="muted" style={{ fontSize: '.8125rem' }}>Arkiv →</Link>
            </div>
            {latestNow ? (
              <div className="card" style={{ padding: '1.25rem 1.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.75rem' }}>
                  <span className="eyebrow">Sist oppdatert</span>
                  <span className="mono dim" style={{ fontSize: '.75rem' }}>
                    {new Date(latestNow.published_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="prose" style={{ fontSize: '.9375rem', lineHeight: 1.6, maxWidth: 'none' }}>
                  <SafeMdx source={latestNow.content} />
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '1.25rem 1.375rem' }}>
                <p className="muted" style={{ fontSize: '.9375rem' }}>Ingen oppdateringer enda.</p>
              </div>
            )}
            <OsloTerminal />
          </div>
        </div>
      </section>
    </>
  )
}
