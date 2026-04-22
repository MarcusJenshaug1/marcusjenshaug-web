import Link from 'next/link'
import Image from 'next/image'
import { FiGrid, FiFile, FiArrowRight, FiGithub, FiLinkedin } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { getFeaturedProjects } from '@/lib/projects'
import { getLatestPosts } from '@/lib/posts'
import { getLatestNowEntry } from '@/lib/now'
import { readingTime } from '@/lib/mdx'
import { SafeMdx } from '@/components/SafeMdx'
import { OsloClock } from '@/components/OsloClock'
import { OsloTerminal } from '@/components/OsloTerminal'
import { ProjectCard } from '@/components/ProjectCard'
import { FiClock } from 'react-icons/fi'

function socialByPlatform(links: { platform: string; url: string }[], name: string) {
  return links.find((l) => l.platform.toLowerCase() === name)
}

export default async function HomePage() {
  const [s, featured, posts, latestNow] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getLatestPosts(4),
    getLatestNowEntry(),
  ])
  const github = socialByPlatform(s.social_links, 'github')
  const linkedin = socialByPlatform(s.social_links, 'linkedin')
  const available = s.available_for_work

  return (
    <>
      <section style={{ padding: '3.5rem 2rem 3rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem', alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>
              {available && (
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.70 0.16 145)', marginRight: 8, verticalAlign: 'middle' }} />
              )}
              {available ? (s.availability_note || 'Tilgjengelig for samtaler') : 'Ikke tilgjengelig akkurat nå'}
              {' · Oslo '}<OsloClock />
            </div>
            <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1.25rem' }}>
              {s.full_name}.<br />
              <span style={{ color: 'var(--ink-3)' }}>{s.headline || 'Fullstack-utvikler'}</span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--ink-2)', maxWidth: '36rem', lineHeight: 1.65, marginTop: '1.5rem' }}>
              {s.bio_short || 'Notater, prosjekter og verktøy fra arbeidet mitt som fullstack-utvikler.'}
            </p>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
              <Link href="/prosjekter" className="btn btn-primary"><FiGrid /> Se prosjekter</Link>
              <Link href="/blogg" className="btn"><FiFile /> Les blogg</Link>
              <Link href="/kontakt" className="btn btn-ghost">Ta kontakt <FiArrowRight style={{ fontSize: '.85em' }} /></Link>
            </div>
            {(github || linkedin) && (
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2rem', alignItems: 'center' }}>
                {github && (
                  <a href={github.url} target="_blank" rel="me noopener noreferrer" className="muted" style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.875rem' }}>
                    <FiGithub /> {github.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin.url} target="_blank" rel="me noopener noreferrer" className="muted" style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.875rem' }}>
                    <FiLinkedin /> {linkedin.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            )}
          </div>
          <aside>
            {s.image_url && (
              <>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--bg-sunken)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--rule)' }}>
                  <Image
                    src={s.image_url}
                    alt={`Portrett av ${s.full_name}`}
                    fill
                    sizes="280px"
                    priority
                    style={{ objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '.75rem .875rem', background: 'linear-gradient(to top, rgba(0,0,0,.7), transparent)', color: '#fff', fontFamily: 'var(--ff-mono)', fontSize: '.6875rem', letterSpacing: '.05em' }}>
                    MARCUS · NO
                  </div>
                </div>
                <div className="mono" style={{ marginTop: '.75rem', fontSize: '.75rem', color: 'var(--ink-4)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>↓ SCROLL</span>
                  <span>001 / 007</span>
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      <hr className="rule" style={{ margin: '0 2rem', maxWidth: 'var(--max-w)' }} />

      <section style={{ padding: '2.5rem 2rem' }}>
        <div className="container">
          <div className="section-head">
            <h2>Utvalgte prosjekter</h2>
            <Link href="/prosjekter" className="muted" style={{ fontSize: '.8125rem' }}>Alle prosjekter →</Link>
          </div>
          {featured.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>Kommer snart.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {featured.slice(0, 3).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <hr className="rule" style={{ margin: '0 2rem', maxWidth: 'var(--max-w)' }} />

      <section style={{ padding: '2.5rem 2rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
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
