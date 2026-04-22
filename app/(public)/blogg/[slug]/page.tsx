import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug } from '@/lib/posts'
import { getSiteSettings } from '@/lib/site-settings'
import { mdxOptions, readingTime } from '@/lib/mdx'

type Params = { slug: string }
type Search = { preview?: string }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const post = await getPostBySlug(slug, preview === '1')
  if (!post) return { title: 'Ikke funnet' }

  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&type=${encodeURIComponent('Notat')}`

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blogg/${post.slug}` },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blogg/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  }
}

function formatLong(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const post = await getPostBySlug(slug, isPreview)
  if (!post) notFound()

  const settings = await getSiteSettings()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: { '@id': `${siteUrl}/#person` },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    image: post.cover_image ? `${siteUrl}${post.cover_image}` : undefined,
    inLanguage: 'nb-NO',
    mainEntityOfPage: `${siteUrl}/blogg/${post.slug}`,
    keywords: post.tags.join(', ') || undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blogg', item: `${siteUrl}/blogg` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blogg/${post.slug}` },
    ],
  }

  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '44rem' }}>
        <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'inherit' }}>hjem</Link> /{' '}
          <Link href="/blogg" style={{ color: 'inherit' }}>blogg</Link> /{' '}
          <span style={{ color: 'var(--ink-2)' }}>{post.slug}</span>
        </nav>

        {isPreview && post.draft && (
          <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
            ★ Utkast-forhåndsvisning
          </div>
        )}

        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
          <span className="dim" style={{ fontSize: '.8125rem' }}>
            · {formatLong(post.published_at)} · {readingTime(post.content)} min
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1rem', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
          {post.title}
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: '2.5rem' }}>
          {post.description}
        </p>

        <div className="prose" style={{ maxWidth: 'none' }}>
          <MDXRemote source={post.content} options={mdxOptions} />
        </div>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--bg-sunken)', borderRadius: '8px' }}>
          <div className="eyebrow" style={{ marginBottom: '.5rem' }}>Hvis du likte dette</div>
          <p style={{ fontSize: '.9375rem' }}>
            Abonnér via <Link href="/rss.xml" className="link">RSS</Link> eller{' '}
            <Link href="/feed.json" className="link">JSON Feed</Link>, eller{' '}
            <Link href="/kontakt" className="link">ta kontakt</Link>.
          </p>
          {settings.social_links.length > 0 && (
            <p style={{ fontSize: '.875rem', marginTop: '.75rem' }} className="muted">
              Del på:{' '}
              {settings.social_links.map((l, i) => (
                <span key={l.url}>
                  {i > 0 && ' · '}
                  <a href={l.url} target="_blank" rel="me noopener noreferrer" className="link" style={{ textTransform: 'capitalize' }}>
                    {l.platform}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </section>
  )
}
