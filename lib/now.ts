import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
import type { NowEntry } from '@/lib/types/app'

export const getNowEntries = unstable_cache(
  async (): Promise<NowEntry[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('now_entries')
      .select('*')
      .order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as NowEntry[]
  },
  ['now-entries'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.now] }
)

export async function getLatestNowEntry(): Promise<NowEntry | null> {
  const entries = await getNowEntries()
  return entries[0] ?? null
}

export async function getAllNowAdmin(): Promise<NowEntry[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('now_entries')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as NowEntry[]
}

export async function getNowByIdAdmin(id: string): Promise<NowEntry | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('now_entries').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as NowEntry | null
}
