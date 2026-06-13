import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import { getFeaturedProjects, getPublishedProjects } from '@/lib/projects'
import { getLatestPosts, getPublishedPosts } from '@/lib/posts'
import { getLatestNowEntry } from '@/lib/now'
import { STACK } from '@/lib/stack'
import { STATS, QUOTES, type Stat } from '@/lib/social-proof'
import { getUsesItems } from '@/lib/uses'
import { SafeMdx } from '@/components/SafeMdx'
import { OsloTerminal } from '@/components/OsloTerminal'
import { Hero } from '@/components/home/Hero'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { TechStack } from '@/components/home/TechStack'
import { SocialProof } from '@/components/home/SocialProof'
import { LatestPosts } from '@/components/home/LatestPosts'
import { IntroOverlay } from '@/components/home/IntroOverlay'

export default async function HomePage() {
  const [s, featured, posts, latestNow, allProjects, allPosts, usesItems] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getLatestPosts(4),
    getLatestNowEntry(),
    getPublishedProjects(),
    getPublishedPosts(),
    getUsesItems(),
  ])

  const stackItems = STACK.map((item) => ({
    ...item,
    projectCount: allProjects.filter((p) =>
      p.tech_stack.some((t) => t.toLowerCase() === item.name.toLowerCase())
    ).length,
  }))

  const derived: Record<Extract<Stat['value'], string>, number> = {
    'derived:projects': allProjects.length,
    'derived:in-production': allProjects.filter((p) => p.status === 'i-drift' || p.status === 'aktiv').length,
    'derived:posts': allPosts.length,
    'derived:uses': usesItems.length,
  }
  const stats = STATS.map((stat) => ({
    label: stat.label,
    value: typeof stat.value === 'number' ? stat.value : derived[stat.value],
    suffix: stat.suffix,
  })).filter((stat) => stat.value > 0)

  return (
    <>
      <IntroOverlay name={s.full_name} />
      <Hero settings={s} />

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="prosjekter">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">002 · Utvalgte prosjekter</span>
            <h2 className="display display-2">Arbeid</h2>
            <Link href="/prosjekter" className="section-head-link mono">
              Alle prosjekter →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>Kommer snart.</p>
          ) : (
            <FeaturedProjects
              projects={featured.slice(0, 4).map((p) => ({
                id: p.id,
                slug: p.slug,
                title: p.title,
                description: p.description,
                tech_stack: p.tech_stack,
                status: p.status,
                cover_image: p.cover_image,
                started_at: p.started_at,
              }))}
            />
          )}
        </div>
      </section>

      <section className="py-14 md:py-20" data-section="stack">
        <div className="container px-5 md:px-8">
          <div className="section-head-xl">
            <span className="eyebrow">003 · Verktøykassa</span>
            <h2 className="display display-2">Stack</h2>
          </div>
        </div>
        <TechStack items={stackItems} />
      </section>

      {(stats.length > 0 || QUOTES.length > 0) && (
        <section className="px-5 py-14 md:px-8 md:py-20" data-section="tall">
          <div className="container">
            <div className="section-head-xl">
              <span className="eyebrow">004 · I tall</span>
              <h2 className="display display-2">Bevis</h2>
            </div>
            <SocialProof stats={stats} quotes={QUOTES} />
          </div>
        </section>
      )}

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="notater">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">005 · Siste notater</span>
            <h2 className="display display-2">Notater</h2>
            <Link href="/blogg" className="section-head-link mono">
              Alle notater →
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>Kommer snart.</p>
          ) : (
            <LatestPosts posts={posts} />
          )}
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="naa">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">007 · Akkurat nå</span>
            <h2 className="display display-2">Nå</h2>
            <Link href="/na" className="section-head-link mono">
              Arkiv →
            </Link>
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
      </section>
    </>
  )
}
