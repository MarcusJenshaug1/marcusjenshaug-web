import type { Locale } from './config'

// Tags og plattformnavn ligger i databasen som korte norske slugs/etiketter.
// Disse oversettes ved visning; ukjente vises som de er.
const TAG_LABELS: Record<string, string> = {
  sideprosjekt: 'side project',
  arkitektur: 'architecture',
  'solo-utvikling': 'solo development',
  retrospektiv: 'retrospective',
  plattform: 'platform',
  produktutvikling: 'product development',
  jobbsøking: 'job hunting',
  selvhosting: 'self-hosting',
}

export function tagLabel(tag: string, locale: Locale): string {
  if (locale === 'nb') return tag
  return TAG_LABELS[tag.toLowerCase()] ?? tag
}

const PLATFORM_WORDS: Record<string, string> = {
  jobb: 'work',
  privat: 'personal',
}

// «GitHub (Jobb)» → «GitHub (work)»; rene plattformnavn er uendret.
export function platformLabel(platform: string, locale: Locale): string {
  if (locale === 'nb') return platform
  return platform.replace(/\(([^)]+)\)/g, (_m, inner: string) => `(${PLATFORM_WORDS[inner.toLowerCase()] ?? inner})`)
}
