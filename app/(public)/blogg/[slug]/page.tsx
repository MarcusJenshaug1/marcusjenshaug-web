import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/posts'
import { getSiteSettings } from '@/lib/site-settings'
import { readingTime } from '@/lib/mdx'
import { SafeMdx } from '@/components/SafeMdx'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/fx/Parallax'
import { ReadingProgress } from '@/components/fx/ReadingProgress'

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

  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}&type=${encodeURIComponent('Notat')}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: settings.full_name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: settings.full_name,
      url: siteUrl,
    },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    image: post.cover_image ? `${siteUrl}${post.cover_image}` : ogImage,
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
    <article className="px-5 py-12 md:px-8 md:py-16">
      <ReadingProgress />
      <div className="container" style={{ maxWidth: '46rem' }}>
        <nav className="breadcrumb mono">
          <TransitionLink href="/">hjem</TransitionLink> /{' '}
          <TransitionLink href="/blogg">blogg</TransitionLink> /{' '}
          <span>{post.slug}</span>
        </nav>

        {isPreview && post.draft && (
          <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
            ★ Utkast-forhåndsvisning
          </div>
        )}

        <div className="article-meta mono">
          {post.tags.map((t) => (
            <span key={t} className="article-meta-tag">
              {t}
            </span>
          ))}
          <span>{formatLong(post.published_at)}</span>
          <span>{readingTime(post.content)} min lesing</span>
        </div>

        <Reveal variant="lines">
          <h1 className="display display-2 article-title">{post.title}</h1>
        </Reveal>

        <Reveal variant="fade" delay={0.2}>
          <p className="article-lede">{post.description}</p>
        </Reveal>

        {post.cover_image && (
          <div className="article-cover">
            <Parallax speed={10}>
              <div className="article-cover-inner">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 736px"
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </Parallax>
          </div>
        )}

        <div className="prose" style={{ maxWidth: 'none' }}>
          <SafeMdx source={post.content} />
        </div>

        <div className="article-outro">
          <div className="eyebrow" style={{ marginBottom: '.5rem' }}>Hvis du likte dette</div>
          <p style={{ fontSize: '.9375rem' }}>
            Abonnér via <a href="/rss.xml" className="link">RSS</a> eller{' '}
            <a href="/feed.json" className="link">JSON Feed</a>, eller{' '}
            <TransitionLink href="/kontakt" className="link">ta kontakt</TransitionLink>.
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
    </article>
  )
}
