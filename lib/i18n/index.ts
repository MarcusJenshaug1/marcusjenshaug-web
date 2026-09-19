import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
import type { DictionaryKey } from './dictionaries'
import type { Locale } from './config'
import { makeTranslator, type Translator } from './client'

export * from './config'
export { makeTranslator, otherLocale, intlLocale } from './client'
export type { DictionaryKey, Translator }

type Overrides = Partial<Record<DictionaryKey, string>>

const getOverrides = unstable_cache(
  async (locale: Locale): Promise<Overrides> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('ui_strings').select('key, value').eq('locale', locale)
    if (error) throw error
    return Object.fromEntries(data.map((row) => [row.key, row.value])) as Overrides
  },
  ['ui-strings'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.ui] }
)

// Server: ordbok + overstyringer fra databasen. Feiler databasen, brukes ordboken alene.
export const getTranslator = cache(async (locale: Locale): Promise<Translator> => {
  let overrides: Overrides = {}
  try {
    overrides = await getOverrides(locale)
  } catch (error) {
    console.error('Kunne ikke hente ui_strings:', error)
  }
  return makeTranslator(locale, overrides)
})
