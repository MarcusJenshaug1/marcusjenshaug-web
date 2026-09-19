import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedProjects, countByStatus } from '@/lib/projects'
import { PROJECT_STATUSES, type ProjectStatus } from '@/lib/types/app'
import { localizeMany } from '@/lib/translations'
import { alternatesFor, breadcrumbs, jsonLd } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { Reveal } from '@/components/motion/Reveal'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  return {
    title: t('projects.title'),
    description: t('meta.projects'),
    alternates: alternatesFor(locale, 'projects'),
    openGraph: { locale: OG_LOCALE[locale], siteName: 'Marcus Jenshaug', title: t('projects.title'), description: t('meta.projects') },
  }
}

function isValidStatus(v: string | undefined): v is ProjectStatus {
  return v !== undefined && (PROJECT_STATUSES as readonly string[]).includes(v)
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const { status } = await searchParams
  const activeStatus: ProjectStatus | 'alle' = isValidStatus(status) ? status : 'alle'

  const all = await localizeMany('projects', await getPublishedProjects(), locale)
  const counts = countByStatus(all)
  const list = activeStatus === 'alle' ? all : all.filter((p) => p.status === activeStatus)
  const base = localePath(locale, 'projects')

  const filters: Array<{ key: ProjectStatus | 'alle'; label: string; href: string }> = [
    { key: 'alle', label: t('projects.filter.all'), href: base },
    ...PROJECT_STATUSES.map((s) => ({
      key: s,
      label: t(`status.${s}`),
      href: `${base}?status=${s}`,
    })),
  ]

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('projects.title'), path: base }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">{t('projects.eyebrow')} · {String(all.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">{t('projects.heading')}</h1>
          </Reveal>
          <p className="page-lede">{t('projects.lede')}</p>
        </div>

        {all.length > 0 && (
          <div className="filter-row mono">
            {filters.map((f) => {
              const isActive = activeStatus === f.key
              return (
                <Link
                  key={f.key}
                  href={f.href}
                  className={`filter-chip${isActive ? ' active' : ''}`}
                >
                  {f.label}
                  <span className="filter-chip-count">{counts[f.key]}</span>
                </Link>
              )
            })}
          </div>
        )}

        {list.length === 0 ? (
          <p className="muted" style={{ marginTop: '2rem' }}>
            {activeStatus === 'alle'
              ? t('projects.empty')
              : t('projects.emptyStatus', { status: t(`status.${activeStatus}`) })}
          </p>
        ) : (
          <FeaturedProjects
            locale={locale}
            projects={list.map((p) => ({
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
