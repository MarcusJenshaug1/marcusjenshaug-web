import type { NextRequest } from 'next/server'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedPosts } from '@/lib/posts'
import { localizeMany } from '@/lib/translations'
import { SOURCE_LOCALE, getTranslator, isLocale, localePath, type RouteKey } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Norsk som standard, ?lang=en gir engelsk oversikt.
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const locale = isLocale(lang) ? lang : SOURCE_LOCALE
  const [t, rawSettings, rawProjects, rawPosts] = await Promise.all([
    getTranslator(locale),
    getSiteSettings(),
    getPublishedProjects(),
    getPublishedPosts(),
  ])
  const settings = localizeSettings(rawSettings, locale)
  const [projects, posts] = await Promise.all([
    localizeMany('projects', rawProjects, locale),
    localizeMany('posts', rawPosts, locale),
  ])
  const url = (key: RouteKey, slug?: string) => `${siteUrl}${localePath(locale, key, slug)}`

  const lines: string[] = []
  lines.push(`# ${settings.full_name}`)
  lines.push('')
  if (settings.bio_short) lines.push(`> ${settings.bio_short}`)
  lines.push('')
  lines.push(`**${t('llms.role')}:** ${settings.headline}`)
  if (settings.location) lines.push(`**${t('about.location')}:** ${settings.location}`)
  lines.push('')

  lines.push(`## ${t('llms.pages')}`)
  lines.push(`- [${t('nav.about')}](${url('about')}) — ${t('llms.personEntity')}`)
  lines.push(`- [${t('nav.projects')}](${url('projects')})`)
  lines.push(`- [${t('nav.blog')}](${url('blog')})`)
  lines.push(`- [${t('nav.now')}](${url('now')})`)
  lines.push(`- [${t('nav.uses')}](${url('uses')})`)
  lines.push(`- [${t('nav.contact')}](${url('contact')})`)
  lines.push('')

  if (projects.length > 0) {
    lines.push(`## ${t('nav.projects')}`)
    for (const p of projects.slice(0, 20)) {
      lines.push(`- [${p.title}](${url('projects', p.slug)}) — ${p.description}`)
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push(`## ${t('llms.articles')}`)
    for (const p of posts.slice(0, 20)) {
      lines.push(`- [${p.title}](${url('blog', p.slug)}) — ${p.description}`)
    }
    lines.push('')
  }

  if (settings.social_links.length > 0) {
    lines.push(`## ${t('about.elsewhere')}`)
    for (const l of settings.social_links) {
      lines.push(`- [${l.platform}](${l.url})`)
    }
    lines.push('')
  }

  const feedQuery = locale === SOURCE_LOCALE ? '' : `?lang=${locale}`
  lines.push(`## ${t('footer.feeds')}`)
  lines.push(`- [RSS](${siteUrl}/rss.xml${feedQuery})`)
  lines.push(`- [JSON Feed](${siteUrl}/feed.json${feedQuery})`)
  lines.push(`- [Sitemap](${siteUrl}/sitemap.xml)`)

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
