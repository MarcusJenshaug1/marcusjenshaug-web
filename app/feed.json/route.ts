import { getPublishedPosts } from '@/lib/posts'
import { getSiteSettings } from '@/lib/site-settings'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

export async function GET() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()])

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: settings.full_name || 'Marcus Jenshaug',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: settings.bio_short || '',
    language: 'nb-NO',
    authors: [{ name: settings.full_name, url: siteUrl }],
    items: posts.map((p) => ({
      id: `${siteUrl}/blogg/${p.slug}`,
      url: `${siteUrl}/blogg/${p.slug}`,
      title: p.title,
      summary: p.description,
      content_text: p.content,
      date_published: p.published_at ?? p.created_at,
      date_modified: p.updated_at,
      tags: p.tags,
      image: p.cover_image ? `${siteUrl}${p.cover_image}` : undefined,
    })),
  }

  return Response.json(feed, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
