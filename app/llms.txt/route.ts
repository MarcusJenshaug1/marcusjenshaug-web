import { getSiteSettings } from '@/lib/site-settings'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedPosts } from '@/lib/posts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

export async function GET() {
  const [settings, projects, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
    getPublishedPosts(),
  ])

  const lines: string[] = []
  lines.push(`# ${settings.full_name}`)
  lines.push('')
  if (settings.bio_short) lines.push(`> ${settings.bio_short}`)
  lines.push('')
  lines.push(`**Rolle:** ${settings.headline}`)
  if (settings.location) lines.push(`**Sted:** ${settings.location}`)
  lines.push('')

  lines.push('## Sider')
  lines.push(`- [Om](${siteUrl}/om) — kanonisk Person-entitet`)
  lines.push(`- [Prosjekter](${siteUrl}/prosjekter)`)
  lines.push(`- [Blogg](${siteUrl}/blogg)`)
  lines.push(`- [Nå](${siteUrl}/na)`)
  lines.push(`- [Uses](${siteUrl}/uses)`)
  lines.push(`- [Kontakt](${siteUrl}/kontakt)`)
  lines.push('')

  if (projects.length > 0) {
    lines.push('## Prosjekter')
    for (const p of projects.slice(0, 20)) {
      lines.push(`- [${p.title}](${siteUrl}/prosjekter/${p.slug}) — ${p.description}`)
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Artikler')
    for (const p of posts.slice(0, 20)) {
      lines.push(`- [${p.title}](${siteUrl}/blogg/${p.slug}) — ${p.description}`)
    }
    lines.push('')
  }

  if (settings.social_links.length > 0) {
    lines.push('## Andre steder')
    for (const l of settings.social_links) {
      lines.push(`- [${l.platform}](${l.url})`)
    }
    lines.push('')
  }

  lines.push('## Feeds')
  lines.push(`- [RSS](${siteUrl}/rss.xml)`)
  lines.push(`- [JSON Feed](${siteUrl}/feed.json)`)
  lines.push(`- [Sitemap](${siteUrl}/sitemap.xml)`)

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
