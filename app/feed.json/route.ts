import type { NextRequest } from 'next/server'
import { getPublishedPosts } from '@/lib/posts'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { localizeMany } from '@/lib/translations'
import { SOURCE_LOCALE, isLocale, localePath } from '@/lib/i18n'
import { absoluteUrl, langTag, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Norsk som standard, ?lang=en gir engelsk feed.
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const locale = isLocale(lang) ? lang : SOURCE_LOCALE
  const [rawPosts, rawSettings] = await Promise.all([getPublishedPosts(), getSiteSettings()])
  const posts = await localizeMany('posts', rawPosts, locale)
  const settings = localizeSettings(rawSettings, locale)
  const feedUrl = `${siteUrl}/feed.json${locale === SOURCE_LOCALE ? '' : `?lang=${locale}`}`

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: settings.full_name || 'Marcus Jenshaug',
    home_page_url: `${siteUrl}${localePath(locale, 'home')}`,
    feed_url: feedUrl,
    description: settings.bio_short || '',
    language: langTag(locale),
    authors: [{ name: settings.full_name, url: siteUrl }],
    items: posts.map((p) => {
      const url = `${siteUrl}${localePath(locale, 'blog', p.slug)}`
      return {
        id: url,
        url,
        title: p.title,
        summary: p.description,
        content_text: p.content,
        date_published: p.published_at ?? p.created_at,
        date_modified: p.updated_at,
        tags: p.tags,
        image: absoluteUrl(p.cover_image),
        language: langTag(p.locale),
      }
    }),
  }

  return Response.json(feed, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
