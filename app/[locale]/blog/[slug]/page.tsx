import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FiStar } from 'react-icons/fi'
import { getPostBySlug, getPublishedPosts } from '@/lib/posts'
import { getSiteSettings } from '@/lib/site-settings'
import { localizeOne, resolveSourceSlug, type LocalizedPost } from '@/lib/translations'
import { readingTime } from '@/lib/mdx'
import { absoluteUrl, alternatesFor, breadcrumbs, formatDate, jsonLd, langTag, ogImageUrl, siteUrl } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath, type Locale } from '@/lib/i18n'
import { platformLabel, tagLabel } from '@/lib/i18n/labels'
import { SafeMdx } from '@/components/SafeMdx'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/fx/Parallax'
import { ReadingProgress } from '@/components/fx/ReadingProgress'

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ preview?: string }>
}

type Loaded = { post: LocalizedPost; slugs: Record<Locale, string> }

async function loadPost(locale: Locale, slug: string, preview: boolean): Promise<Loaded | null> {
  const sourceSlug = await resolveSourceSlug('posts', slug, locale, await getPublishedPosts())
  const raw = await getPostBySlug(sourceSlug, preview)
  if (!raw) return null
  const [post, en] = await Promise.all([localizeOne('posts', raw, locale), localizeOne('posts', raw, 'en')])
  return { post, slugs: { nb: raw.slug, en: en.slug } }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const { preview } = await searchParams
  const t = await getTranslator(locale)
  const loaded = await loadPost(locale, slug, preview === '1')
  if (!loaded) return { title: t('notFound.title') }
  const { post, slugs } = loaded

  const ogImage = ogImageUrl(locale, post.title, t('og.post'))
  const alternates = alternatesFor(locale, 'blog', slugs)

  return {
    title: post.title,
    description: post.description,
    alternates,
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      locale: OG_LOCALE[locale],
      siteName: 'Marcus Jenshaug',
      url: alternates.canonical,
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

function laterOf(a: string | null, b: string): string {
  if (!a) return b
  return new Date(a).getTime() > new Date(b).getTime() ? a : b
}

export default async function PostDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const { preview } = await searchParams
  const isPreview = preview === '1'
  const t = await getTranslator(locale)

  const loaded = await loadPost(locale, slug, isPreview)
  if (!loaded) notFound()
  const { post } = loaded

  const settings = await getSiteSettings()
  const postUrl = `${siteUrl}${localePath(locale, 'blog', post.slug)}`
  const ogImage = `${siteUrl}${ogImageUrl(locale, post.title, t('og.post'))}`
  const feedQuery = locale === 'nb' ? '' : `?lang=${locale}`

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
    dateModified: laterOf(post.published_at, post.updated_at),
    image: absoluteUrl(post.cover_image) ?? ogImage,
    inLanguage: langTag(post.locale),
    mainEntityOfPage: postUrl,
    keywords: post.tags.join(', ') || undefined,
  }

  const breadcrumbSchema = breadcrumbs(locale, t, [
    { name: t('blog.title'), path: localePath(locale, 'blog') },
    { name: post.title, path: localePath(locale, 'blog', post.slug) },
  ])

  return (
    <article className="px-5 py-12 md:px-8 md:py-16">
      <ReadingProgress />
      <div className="container" style={{ maxWidth: '46rem' }}>
        <nav className="breadcrumb mono" aria-label={t('nav.breadcrumbs')}>
          <TransitionLink href={localePath(locale, 'home')}>{t('nav.home').toLowerCase()}</TransitionLink> /{' '}
          <TransitionLink href={localePath(locale, 'blog')}>{t('nav.blog').toLowerCase()}</TransitionLink> /{' '}
          <span>{post.slug}</span>
        </nav>

        {isPreview && post.draft && (
          <div className="chip chip-accent" style={{ marginBottom: '1rem' }}>
            <FiStar aria-hidden /> {t('blog.draftPreview')}
          </div>
        )}

        {!post.localized && locale !== 'nb' && (
          <p className="mono dim" style={{ marginBottom: '1rem', fontSize: '.8125rem' }}>
            {t('locale.onlyIn.nb')}
          </p>
        )}

        <div className="article-meta mono">
          {post.tags.map((tag) => (
            <span key={tag} className="article-meta-tag">
              {tagLabel(tag, locale)}
            </span>
          ))}
          {post.published_at && (
            <time dateTime={post.published_at}>{formatDate(post.published_at, undefined, locale)}</time>
          )}
          <span>{t('blog.readingTime', { minutes: readingTime(post.content) })}</span>
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

        {post.machineTranslated && (
          <p className="mono dim" style={{ marginTop: '2rem', fontSize: '.75rem' }}>
            {t('locale.machineTranslated')}
          </p>
        )}

        <div className="article-outro">
          <div className="eyebrow" style={{ marginBottom: '.5rem' }}>{t('blog.outro.title')}</div>
          <p style={{ fontSize: '.9375rem' }}>
            {t('blog.outro.subscribe')} <a href={`/rss.xml${feedQuery}`} className="link">RSS</a> {t('blog.outro.or')}{' '}
            <a href={`/feed.json${feedQuery}`} className="link">JSON Feed</a>, {t('blog.outro.or')}{' '}
            <TransitionLink href={localePath(locale, 'contact')} className="link">{t('blog.outro.contact')}</TransitionLink>.
          </p>
          {settings.social_links.length > 0 && (
            <p style={{ fontSize: '.875rem', marginTop: '.75rem' }} className="muted">
              {t('blog.shareOn')}{' '}
              {settings.social_links.map((l, i) => (
                <span key={l.url}>
                  {i > 0 && ' · '}
                  <a href={l.url} target="_blank" rel="me noopener noreferrer" className="link" style={{ textTransform: 'capitalize' }}>
                    {platformLabel(l.platform, locale)}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </article>
  )
}
