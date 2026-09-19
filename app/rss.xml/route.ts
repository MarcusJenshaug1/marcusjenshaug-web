import type { NextRequest } from 'next/server'
import { getPublishedPosts } from '@/lib/posts'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { localizeMany } from '@/lib/translations'
import { SOURCE_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { langTag, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(html: string): string {
  return `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

// Norsk som standard, ?lang=en gir engelsk feed.
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const locale = isLocale(lang) ? lang : SOURCE_LOCALE
  const [t, rawPosts, rawSettings] = await Promise.all([getTranslator(locale), getPublishedPosts(), getSiteSettings()])
  const posts = await localizeMany('posts', rawPosts, locale)
  const settings = localizeSettings(rawSettings, locale)
  const selfUrl = `${siteUrl}/rss.xml${locale === SOURCE_LOCALE ? '' : `?lang=${locale}`}`

  const items = posts
    .map((p) => {
      const link = `${siteUrl}${localePath(locale, 'blog', p.slug)}`
      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : new Date(p.created_at).toUTCString()
      const categories = p.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')
      const html = `<p>${escapeXml(p.description)}</p><p><a href="${link}">${escapeXml(t('feed.readMore'))}</a></p>`
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.description)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
      ${categories}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(settings.full_name || 'Marcus Jenshaug')}</title>
    <link>${siteUrl}${localePath(locale, 'home')}</link>
    <description>${escapeXml(settings.bio_short || t('meta.siteDescription'))}</description>
    <language>${langTag(locale)}</language>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
