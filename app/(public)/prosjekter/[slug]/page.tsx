import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FiExternalLink, FiGithub, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { getProjectBySlug, getAdjacentProjects } from '@/lib/projects'
import { PROJECT_STATUS_LABELS } from '@/lib/types/app'
import { SafeMdx } from '@/components/SafeMdx'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/fx/Parallax'
import { Marquee } from '@/components/fx/Marquee'

type Params = { slug: string }
type Search = { preview?: string }

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const project = await getProjectBySlug(slug, preview === '1')
  if (!project) return { title: 'Ikke funnet' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'
  const ogImage = `/api/og?title=${encodeURIComponent(project.title)}&type=${encodeURIComponent('Prosjekt')}`

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/prosjekter/${project.slug}` },
    robots: project.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: `${siteUrl}/prosjekter/${project.slug}`,
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

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const project = await getProjectBySlug(slug, isPreview)

  if (!project) notFound()

  const { prev, next } = await getAdjacentProjects(slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `${siteUrl}/prosjekter/${project.slug}`,
    creator: { '@id': `${siteUrl}/#person` },
    dateCreated: project.started_at ?? undefined,
    dateModified: project.updated_at,
    image: project.cover_image ? `${siteUrl}${project.cover_image}` : undefined,
    keywords: project.tech_stack.join(', ') || undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Prosjekter', item: `${siteUrl}/prosjekter` },
      { '@type': 'ListItem', position: 3, name: project.title, item: `${siteUrl}/prosjekter/${project.slug}` },
    ],
  }

  return (
    <article>
      <section className="project-hero px-5 pt-12 md:px-8 md:pt-16">
        <div className="container">
          <nav className="breadcrumb mono">
            <TransitionLink href="/">hjem</TransitionLink> /{' '}
            <TransitionLink href="/prosjekter">prosjekter</TransitionLink> /{' '}
            <span>{project.slug}</span>
          </nav>

          {isPreview && project.draft && (
            <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
              ★ Utkast-forhåndsvisning
            </div>
          )}

          <div className="project-hero-meta mono">
            <span className="project-hero-status">{PROJECT_STATUS_LABELS[project.status]}</span>
            {project.role && <span>{project.role}</span>}
            {project.started_at && (
              <span>
                {formatMonth(project.started_at)}
                {project.ended_at && ` – ${formatMonth(project.ended_at)}`}
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
                  <FiExternalLink aria-hidden /> Åpne
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-xl mono"
                >
                  <FiGithub aria-hidden /> Repo
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
                alt={`Skjermbilde fra ${project.title}`}
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
        <div className="project-tech-strip" aria-label="Teknologier">
          <Marquee duration={26}>
            {project.tech_stack.map((t) => (
              <span key={t} className="project-tech-item mono">
                {t}
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
        </div>
      </section>

      {(prev || next) && (
        <nav className="project-adjacent" aria-label="Flere prosjekter">
          {prev && (
            <TransitionLink href={`/prosjekter/${prev.slug}`} className="project-adjacent-link">
              <span className="mono project-adjacent-label">
                <FiArrowLeft aria-hidden /> Forrige
              </span>
              <span className="display display-3">{prev.title}</span>
            </TransitionLink>
          )}
          {next && (
            <TransitionLink
              href={`/prosjekter/${next.slug}`}
              className="project-adjacent-link project-adjacent-next"
            >
              <span className="mono project-adjacent-label">
                Neste <FiArrowRight aria-hidden />
              </span>
              <span className="display display-3">{next.title}</span>
            </TransitionLink>
          )}
        </nav>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </article>
  )
}
