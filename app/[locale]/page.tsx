import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedPosts } from '@/lib/posts'
import { getLatestNowEntry } from '@/lib/now'
import { getStack } from '@/lib/stack'
import { getStats, QUOTES, type StatValue } from '@/lib/social-proof'
import { getUsesItems } from '@/lib/uses'
import { localizeMany, localizeOne } from '@/lib/translations'
import { getTranslator, isLocale, localePath } from '@/lib/i18n'
import { Hero } from '@/components/home/Hero'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { TechStack } from '@/components/home/TechStack'
import { SocialProofScene } from '@/components/home/SocialProofScene'
import { LatestPosts } from '@/components/home/LatestPosts'
import { IntroOverlay } from '@/components/home/IntroOverlay'
import { Makkos } from '@/components/home/Makkos'
import { NowTerminal } from '@/components/home/NowTerminal'
import { ContactCta } from '@/components/home/ContactCta'
import { getSpotifyUrl } from '@/lib/makkos'

type Props = { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)

  const [settings, latestNowRaw, allProjectsRaw, allPostsRaw, usesItems] = await Promise.all([
    getSiteSettings(),
    getLatestNowEntry(),
    getPublishedProjects(),
    getPublishedPosts(),
    getUsesItems(),
  ])
  const s = localizeSettings(settings, locale)
  const [allProjects, allPosts, latestNow] = await Promise.all([
    localizeMany('projects', allProjectsRaw, locale),
    localizeMany('posts', allPostsRaw, locale),
    latestNowRaw ? localizeOne('now_entries', latestNowRaw, locale) : null,
  ])
  const featured = allProjects.filter((p) => p.featured)
  const posts = allPosts.slice(0, 4)

  const stackItems = getStack(t).map((item) => ({
    ...item,
    projectCount: allProjects.filter((p) =>
      p.tech_stack.some((tech) => tech.toLowerCase() === item.name.toLowerCase())
    ).length,
  }))

  const derived: Record<Extract<StatValue, string>, number> = {
    'derived:projects': allProjects.length,
    'derived:in-production': allProjects.filter((p) => p.status === 'i-drift' || p.status === 'aktiv').length,
    'derived:posts': allPosts.length,
    'derived:uses': usesItems.length,
  }
  const stats = getStats(t)
    .map((stat) => ({
      label: stat.label,
      value: typeof stat.value === 'number' ? stat.value : derived[stat.value],
      suffix: stat.suffix,
    }))
    .filter((stat) => stat.value > 0)

  return (
    <>
      <IntroOverlay locale={locale} name={s.full_name} />
      <Hero locale={locale} t={t} settings={s} />

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="prosjekter">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">{t('home.projects.eyebrow')}</span>
            <h2 className="display display-2">{t('home.projects.title')}</h2>
            <Link href={localePath(locale, 'projects')} className="section-head-link mono">
              {t('home.projects.all')} →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>{t('home.comingSoon')}</p>
          ) : (
            <FeaturedProjects
              locale={locale}
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
            <span className="eyebrow">{t('home.stack.eyebrow')}</span>
            <h2 className="display display-2">{t('home.stack.title')}</h2>
          </div>
        </div>
        <TechStack locale={locale} items={stackItems} />
      </section>

      {(stats.length > 0 || QUOTES.length > 0) && (
        <section className="py-14 md:py-20" data-section="tall">
          <div className="container px-5 md:px-8">
            <div className="section-head-xl">
              <span className="eyebrow">{t('home.proof.eyebrow')}</span>
              <h2 className="display display-2">{t('home.proof.title')}</h2>
            </div>
          </div>
          <SocialProofScene locale={locale} stats={stats} quotes={QUOTES} />
        </section>
      )}

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="notater">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">{t('home.posts.eyebrow')}</span>
            <h2 className="display display-2">{t('home.posts.title')}</h2>
            <Link href={localePath(locale, 'blog')} className="section-head-link mono">
              {t('home.posts.all')} →
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="muted" style={{ fontSize: '.9375rem' }}>{t('home.comingSoon')}</p>
          ) : (
            <LatestPosts locale={locale} t={t} posts={posts} />
          )}
        </div>
      </section>

      <section className="makkos-section px-5 py-14 md:px-8 md:py-20" data-section="makkos">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">{t('home.music.eyebrow')}</span>
            <h2 className="display display-2">{t('home.music.title')}</h2>
          </div>
          <Makkos locale={locale} spotifyUrl={getSpotifyUrl(s)} />
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 md:py-20" data-section="naa">
        <div className="container">
          <div className="section-head-xl">
            <span className="eyebrow">{t('home.now.eyebrow')}</span>
            <h2 className="display display-2">{t('home.now.title')}</h2>
            <Link href={localePath(locale, 'now')} className="section-head-link mono">
              {t('home.now.archive')} →
            </Link>
          </div>
          <NowTerminal locale={locale} t={t} entry={latestNow} />
        </div>
      </section>

      <ContactCta
        locale={locale}
        t={t}
        email={s.email}
        available={s.available_for_work}
        availabilityNote={s.availability_note}
      />
    </>
  )
}
