import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FiRss } from 'react-icons/fi'
import { getPublishedPosts } from '@/lib/posts'
import { localizeMany, type LocalizedPost } from '@/lib/translations'
import { alternatesFor, breadcrumbs, formatDate, jsonLd } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Reveal } from '@/components/motion/Reveal'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  return {
    title: t('blog.title'),
    description: t('meta.blog'),
    alternates: alternatesFor(locale, 'blog'),
    openGraph: { locale: OG_LOCALE[locale], siteName: 'Marcus Jenshaug', title: t('blog.title'), description: t('meta.blog') },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const posts = await localizeMany('posts', await getPublishedPosts(), locale)
  const feedQuery = locale === 'nb' ? '' : `?lang=${locale}`

  const groups: Record<string, LocalizedPost[]> = {}
  for (const post of posts) {
    const year = post.published_at ? formatDate(post.published_at, { year: 'numeric' }, locale) : '—'
    if (!groups[year]) groups[year] = []
    groups[year].push(post)
  }
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a))

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('blog.title'), path: localePath(locale, 'blog') }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">{t('blog.eyebrow')} · {String(posts.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">{t('blog.heading')}</h1>
          </Reveal>
          <div className="feed-row mono">
            <a href={`/rss.xml${feedQuery}`} className="filter-chip">
              <FiRss aria-hidden /> RSS
            </a>
            <a href={`/feed.json${feedQuery}`} className="filter-chip">
              JSON Feed
            </a>
            <span className="feed-row-count">
              {t(posts.length === 1 ? 'blog.countOne' : 'blog.countMany', { count: posts.length })}
            </span>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="muted">{t('blog.empty')}</p>
        ) : (
          years.map((year) => (
            <div key={year} className="year-group">
              <div className="year-group-head">
                <span className="year-group-year display tabular">{year}</span>
                <span className="mono dim year-group-count">
                  {t(groups[year].length === 1 ? 'blog.yearCountOne' : 'blog.yearCountMany', {
                    count: groups[year].length,
                  })}
                </span>
              </div>
              <LatestPosts locale={locale} t={t} posts={groups[year]} />
            </div>
          ))
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
