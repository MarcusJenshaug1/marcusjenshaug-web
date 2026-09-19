import { LOCALES, OG_LOCALE, localePath, type Locale, type RouteKey } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

const DATE_LOCALE: Record<Locale, string> = { nb: 'nb-NO', en: 'en-GB' }

// BCP 47-tag til <html lang>, RSS <language> og JSON-LD inLanguage.
export function langTag(locale: Locale): string {
  return OG_LOCALE[locale].replace('_', '-')
}

export function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${siteUrl}${path}`
}

export function formatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' },
  locale: Locale = 'nb'
): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(DATE_LOCALE[locale], { timeZone: 'Europe/Oslo', ...opts })
}

export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\u003c')
}

type Crumb = { name: string; path: string }

export function breadcrumbs(locale: Locale, t: Translator, items: Crumb[]) {
  const all: Crumb[] = [{ name: t('nav.home'), path: localePath(locale, 'home') }, ...items]
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

// Kanonisk URL og hreflang-varianter for en side. Slug kan variere per språk;
// mangler engelsk slug brukes den norske.
export function alternatesFor(locale: Locale, key: RouteKey, slugs?: Partial<Record<Locale, string>>) {
  const urls = Object.fromEntries(
    LOCALES.map((l) => [l, `${siteUrl}${localePath(l, key, slugs?.[l] ?? slugs?.nb)}`])
  ) as Record<Locale, string>
  return {
    canonical: urls[locale],
    languages: { ...urls, 'x-default': urls.en },
  }
}

export function ogImageUrl(locale: Locale, title: string, type?: string): string {
  const params = new URLSearchParams({ title, lang: locale })
  if (type) params.set('type', type)
  return `/api/og?${params.toString()}`
}
