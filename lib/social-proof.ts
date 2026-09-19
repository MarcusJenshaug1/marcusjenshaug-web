import type { DictionaryKey, Translator } from '@/lib/i18n'

export type StatValue = 'derived:projects' | 'derived:in-production' | 'derived:posts' | 'derived:uses' | number

export type Stat = {
  label: string
  value: StatValue
  suffix?: string
}

const STAT_ENTRIES: Array<{ label: DictionaryKey; value: StatValue; suffix?: string }> = [
  { label: 'stats.projects', value: 'derived:projects' },
  { label: 'stats.inProduction', value: 'derived:in-production' },
  { label: 'stats.posts', value: 'derived:posts' },
  { label: 'stats.uses', value: 'derived:uses' },
]

export function getStats(t: Translator): Stat[] {
  return STAT_ENTRIES.map((stat) => ({ ...stat, label: t(stat.label) }))
}

export type Quote = {
  quote: string
  name: string
  role: string
}

// Sitater/anbefalinger. Fyll inn ekte sitater her — seksjonen rendres
// først når listen har innhold.
export const QUOTES: Quote[] = []
