import type { MetadataRoute } from 'next'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedPosts } from '@/lib/posts'
import { localizeMany } from '@/lib/translations'
import { LOCALES, localePath, type Locale, type RouteKey } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

type Entry = Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>

// Én oppføring per språk, hver med hreflang-lenker til alle språkvariantene.
function localizedEntries(key: RouteKey, slugs: Record<Locale, string> | undefined, entry: Entry): MetadataRoute.Sitemap {
  const urls = Object.fromEntries(
    LOCALES.map((l) => [l, `${siteUrl}${localePath(l, key, slugs?.[l])}`])
  ) as Record<Locale, string>
  return LOCALES.map((l) => ({ ...entry, url: urls[l], alternates: { languages: urls } }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries('home', undefined, { lastModified: now, changeFrequency: 'weekly', priority: 1 }),
    ...localizedEntries('about', undefined, { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }),
    ...localizedEntries('projects', undefined, { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }),
    ...localizedEntries('blog', undefined, { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }),
    ...localizedEntries('now', undefined, { lastModified: now, changeFrequency: 'weekly', priority: 0.7 }),
    ...localizedEntries('uses', undefined, { lastModified: now, changeFrequency: 'monthly', priority: 0.6 }),
    ...localizedEntries('contact', undefined, { lastModified: now, changeFrequency: 'yearly', priority: 0.6 }),
  ]

  const [projects, posts] = await Promise.all([getPublishedProjects(), getPublishedPosts()])
  const [projectsEn, postsEn] = await Promise.all([
    localizeMany('projects', projects, 'en'),
    localizeMany('posts', posts, 'en'),
  ])
  const enSlug = (rows: Array<{ id: string; slug: string }>, id: string, fallback: string) =>
    rows.find((r) => r.id === id)?.slug ?? fallback

  const projectRoutes = projects.flatMap((p) =>
    localizedEntries(
      'projects',
      { nb: p.slug, en: enSlug(projectsEn, p.id, p.slug) },
      { lastModified: new Date(p.updated_at), changeFrequency: 'monthly', priority: 0.7 }
    )
  )

  const postRoutes = posts.flatMap((p) =>
    localizedEntries(
      'blog',
      { nb: p.slug, en: enSlug(postsEn, p.id, p.slug) },
      { lastModified: new Date(p.updated_at), changeFrequency: 'monthly', priority: 0.7 }
    )
  )

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
