import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
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
