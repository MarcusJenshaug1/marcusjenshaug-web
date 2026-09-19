import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FiExternalLink, FiGithub, FiArrowLeft, FiArrowRight, FiStar } from 'react-icons/fi'
import { getProjectBySlug, getAdjacentProjects, getPublishedProjects } from '@/lib/projects'
import { localizeMany, localizeOne, resolveSourceSlug, type LocalizedProject } from '@/lib/translations'
import { absoluteUrl, alternatesFor, breadcrumbs, formatDate, jsonLd, langTag, ogImageUrl, siteUrl } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath, type Locale } from '@/lib/i18n'
import { SafeMdx } from '@/components/SafeMdx'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/fx/Parallax'
import { Marquee } from '@/components/fx/Marquee'

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ preview?: string }>
}

type Loaded = { project: LocalizedProject; slugs: Record<Locale, string> }

// Slår opp prosjektet fra slug i gjeldende språk og finner slug i begge språk
// til hreflang.
async function loadProject(locale: Locale, slug: string, preview: boolean): Promise<Loaded | null> {
  const sourceSlug = await resolveSourceSlug('projects', slug, locale, await getPublishedProjects())
  const raw = await getProjectBySlug(sourceSlug, preview)
  if (!raw) return null
  const [project, en] = await Promise.all([
    localizeOne('projects', raw, locale),
    localizeOne('projects', raw, 'en'),
  ])
  return { project, slugs: { nb: raw.slug, en: en.slug } }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const { preview } = await searchParams
  const t = await getTranslator(locale)
  const loaded = await loadProject(locale, slug, preview === '1')
  if (!loaded) return { title: t('notFound.title') }
  const { project, slugs } = loaded

  const ogImage = ogImageUrl(locale, project.title, t('og.project'))
  const alternates = alternatesFor(locale, 'projects', slugs)

  return {
    title: project.title,
    description: project.description,
    alternates,
    robots: project.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      locale: OG_LOCALE[locale],
      siteName: 'Marcus Jenshaug',
      url: alternates.canonical,
      title: project.title,
      description: project.description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [ogImage],
    },
  }
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const t = await getTranslator(locale)

  const loaded = await loadProject(locale, slug, isPreview)
  if (!loaded) notFound()
  const { project } = loaded

  const adjacent = await getAdjacentProjects(project.sourceSlug)
  const adjacentLocalized = await localizeMany(
    'projects',
    [adjacent.prev, adjacent.next].filter((p) => p !== null),
    locale
  )
  const prev = adjacentLocalized.find((p) => p.id === adjacent.prev?.id) ?? null
  const next = adjacentLocalized.find((p) => p.id === adjacent.next?.id) ?? null

  const formatMonth = (date: string) => formatDate(date, { month: 'long', year: 'numeric' }, locale)
  const projectUrl = `${siteUrl}${localePath(locale, 'projects', project.slug)}`

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: projectUrl,
    creator: { '@id': `${siteUrl}/#person` },
    dateCreated: project.started_at ?? undefined,
    dateModified: project.updated_at,
    image: absoluteUrl(project.cover_image),
    inLanguage: langTag(project.locale),
    keywords: project.tech_stack.join(', ') || undefined,
  }

  const breadcrumbSchema = breadcrumbs(locale, t, [
    { name: t('projects.title'), path: localePath(locale, 'projects') },
    { name: project.title, path: localePath(locale, 'projects', project.slug) },
  ])

  return (
    <article>
      <section className="project-hero px-5 pt-12 md:px-8 md:pt-16">
        <div className="container">
          <nav className="breadcrumb mono" aria-label={t('nav.breadcrumbs')}>
            <TransitionLink href={localePath(locale, 'home')}>{t('nav.home').toLowerCase()}</TransitionLink> /{' '}
            <TransitionLink href={localePath(locale, 'projects')}>{t('nav.projects').toLowerCase()}</TransitionLink> /{' '}
            <span>{project.slug}</span>
          </nav>

          {isPreview && project.draft && (
            <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
              <FiStar aria-hidden /> {t('projects.draftPreview')}
            </div>
          )}

          {!project.localized && locale !== 'nb' && (
            <p className="mono dim" style={{ marginBottom: '1rem', fontSize: '.8125rem' }}>
              {t('locale.onlyIn.nb')}
            </p>
          )}

          <div className="project-hero-meta mono">
            <span className="project-hero-status">{t(`status.${project.status}`)}</span>
            {project.role && <span>{project.role}</span>}
            {project.started_at && (
              <span>
                <time dateTime={project.started_at}>{formatMonth(project.started_at)}</time>
                {project.ended_at && (
                  <>
                    {' – '}
                    <time dateTime={project.ended_at}>{formatMonth(project.ended_at)}</time>
                  </>
                )}
              </span>
            )}
          </div>

          <Reveal variant="chars">
            <h1 className="display display-1 project-hero-title">{project.title}</h1>
          </Reveal>

          <Reveal variant="fade" delay={0.2}>
            <p className="page-lede project-hero-desc">{project.description}</p>
          </Reveal>

          {(project.live_url || project.repo_url) && (
            <div className="project-hero-ctas">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-xl btn-xl-solid mono"
                >
                  <FiExternalLink aria-hidden /> {t('projects.open')}
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-xl mono"
                >
                  <FiGithub aria-hidden /> {t('projects.repo')}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {project.cover_image && (
        <div className="project-cover">
          <Parallax speed={16}>
            <div className="project-cover-inner">
              <Image
                src={project.cover_image}
                alt={t('projects.coverAlt', { title: project.title })}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          </Parallax>
        </div>
      )}

      {project.tech_stack.length > 0 && (
        <div className="project-tech-strip" aria-label={t('projects.technologies')}>
          <Marquee duration={26}>
            {project.tech_stack.map((tech) => (
              <span key={tech} className="project-tech-item mono">
                {tech}
                <span className="tech-item-sep" aria-hidden>
                  ✕
                </span>
              </span>
            ))}
          </Marquee>
        </div>
      )}

      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="container" style={{ maxWidth: '46rem' }}>
          <div className="prose" style={{ maxWidth: 'none' }}>
            <SafeMdx source={project.content} />
          </div>
          {project.machineTranslated && (
            <p className="mono dim" style={{ marginTop: '2rem', fontSize: '.75rem' }}>
              {t('locale.machineTranslated')}
            </p>
          )}
        </div>
      </section>

      {(prev || next) && (
        <nav className="project-adjacent" aria-label={t('projects.more')}>
          {prev && (
            <TransitionLink href={localePath(locale, 'projects', prev.slug)} className="project-adjacent-link">
              <span className="mono project-adjacent-label">
                <FiArrowLeft aria-hidden /> {t('projects.previous')}
              </span>
              <span className="display display-3">{prev.title}</span>
            </TransitionLink>
          )}
          {next && (
            <TransitionLink
              href={localePath(locale, 'projects', next.slug)}
              className="project-adjacent-link project-adjacent-next"
            >
              <span className="mono project-adjacent-label">
                {t('projects.next')} <FiArrowRight aria-hidden />
              </span>
              <span className="display display-3">{next.title}</span>
            </TransitionLink>
          )}
        </nav>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(creativeWorkSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </article>
  )
}
