export const LOCALES = ['nb', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const SOURCE_LOCALE: Locale = 'nb'
export const LOCALE_COOKIE = 'mj-locale'

// Land der norsk er et naturlig førstevalg. Dansker og svensker får norsk
// pluss en tydelig knapp for engelsk.
export const NORDIC_COUNTRIES = ['NO', 'SE', 'DK'] as const

export const LOCALE_LABELS: Record<Locale, string> = {
  nb: 'Norsk',
  en: 'English',
}

export const HTML_LANG: Record<Locale, string> = {
  nb: 'nb',
  en: 'en',
}

export const OG_LOCALE: Record<Locale, string> = {
  nb: 'nb_NO',
  en: 'en_US',
}

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale)
}

// Sti-segmenter per språk. Norske stier er de opprinnelige, engelske er nye.
export const ROUTES = {
  home: { nb: '', en: '' },
  projects: { nb: 'prosjekter', en: 'projects' },
  blog: { nb: 'blogg', en: 'blog' },
  now: { nb: 'na', en: 'now' },
  uses: { nb: 'uses', en: 'uses' },
  about: { nb: 'om', en: 'about' },
  contact: { nb: 'kontakt', en: 'contact' },
} as const

export type RouteKey = keyof typeof ROUTES

export function routeSegment(key: RouteKey, locale: Locale): string {
  return ROUTES[key][locale]
}

export function localePath(locale: Locale, key: RouteKey, slug?: string): string {
  const segment = routeSegment(key, locale)
  const parts = [locale, segment, slug].filter(Boolean)
  return `/${parts.join('/')}`
}

// Finner rutenøkkel fra et segment, uansett språk (så /en/prosjekter også forstås).
export function routeKeyFromSegment(segment: string): RouteKey | null {
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key].nb === segment || ROUTES[key].en === segment) return key
  }
  return null
}
