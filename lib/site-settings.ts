import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
import type { Locale } from '@/lib/i18n/config'
import type { SiteSettings } from '@/lib/types/app'

const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (error) throw error
    return data
  },
  ['site-settings'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.settings] }
)

function fallbackSettings(): SiteSettings {
  return {
    id: 1,
    full_name: 'Marcus Jenshaug',
    headline: '',
    bio_short: '',
    bio_long: '',
    email: '',
    location: 'Norge',
    available_for_work: false,
    availability_note: null,
    cv_url: null,
    image_url: '/portrett.jpg',
    headline_en: '',
    bio_short_en: '',
    bio_long_en: '',
    location_en: null,
    availability_note_en: null,
    social_links: [],
    updated_at: new Date().toISOString(),
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await getCachedSiteSettings()
  } catch (error) {
    console.error('Kunne ikke hente site_settings:', error)
    return fallbackSettings()
  }
})

// Bytter tekstfeltene til engelsk der en engelsk variant finnes. Tomme
// engelske felt faller tilbake til norsk.
export function localizeSettings(settings: SiteSettings, locale: Locale): SiteSettings {
  if (locale !== 'en') return settings
  const pick = <T extends string | null>(nb: T, en: T): T => (en?.trim() ? en : nb)
  return {
    ...settings,
    headline: pick(settings.headline, settings.headline_en),
    bio_short: pick(settings.bio_short, settings.bio_short_en),
    bio_long: pick(settings.bio_long, settings.bio_long_en),
    location: pick(settings.location, settings.location_en),
    availability_note: pick(settings.availability_note, settings.availability_note_en),
  }
}
