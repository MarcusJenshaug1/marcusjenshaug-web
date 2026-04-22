import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/lib/types/app'

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()

  if (error || !data) {
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

  return data
})
