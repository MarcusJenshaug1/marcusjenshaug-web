export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

export function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${siteUrl}${path}`
}

export function formatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('nb-NO', { timeZone: 'Europe/Oslo', ...opts })
}

export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\u003c')
}

type Crumb = { name: string; path: string }

export function breadcrumbs(items: Crumb[]) {
  const all: Crumb[] = [{ name: 'Hjem', path: '/' }, ...items]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}
