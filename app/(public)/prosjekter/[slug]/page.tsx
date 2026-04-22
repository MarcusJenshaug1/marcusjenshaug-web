import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { FiExternalLink, FiGithub } from 'react-icons/fi'
import { getProjectBySlug } from '@/lib/projects'
import { PROJECT_STATUS_LABELS } from '@/lib/types/app'

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
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/prosjekter/${project.slug}` },
    robots: project.draft ? { index: false, follow: false } : undefined,
  }
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
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '44rem' }}>
        <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'inherit' }}>hjem</Link> /{' '}
          <Link href="/prosjekter" style={{ color: 'inherit' }}>prosjekter</Link> /{' '}
          <span style={{ color: 'var(--ink-2)' }}>{project.slug}</span>
        </nav>

        {isPreview && project.draft && (
          <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
            ★ Utkast-forhåndsvisning
          </div>
        )}

        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="chip">{PROJECT_STATUS_LABELS[project.status]}</span>
          {project.role && <span className="dim" style={{ fontSize: '.8125rem' }}>· {project.role}</span>}
          {project.started_at && (
            <span className="dim" style={{ fontSize: '.8125rem' }}>
              · {new Date(project.started_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
              {project.ended_at && ` – ${new Date(project.ended_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}`}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1rem', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
          {project.title}
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
          {project.description}
        </p>

        {(project.live_url || project.repo_url) && (
          <div style={{ display: 'flex', gap: '.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <FiExternalLink /> Åpne
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                <FiGithub /> Repo
              </a>
            )}
          </div>
        )}

        {project.tech_stack.length > 0 && (
          <div style={{ display: 'flex', gap: '.375rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {project.tech_stack.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        )}

        <div className="prose" style={{ maxWidth: 'none' }}>
          <MDXRemote source={project.content} />
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </section>
  )
}
