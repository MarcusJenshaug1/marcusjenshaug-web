import { getPublishedPosts } from '@/lib/posts'
import { getSiteSettings } from '@/lib/site-settings'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()])

  const items = posts
    .map((p) => {
      const link = `${siteUrl}/blogg/${p.slug}`
      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : new Date(p.created_at).toUTCString()
      const categories = p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('')
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.description)}</description>
      <content:encoded><![CDATA[${p.content}]]></content:encoded>
      ${categories}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(settings.full_name || 'Marcus Jenshaug')}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(settings.bio_short || 'Fullstack-utvikler i Redi AS.')}</description>
    <language>nb-NO</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
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
