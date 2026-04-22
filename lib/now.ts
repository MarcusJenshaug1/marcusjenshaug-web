import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { NowEntry } from '@/lib/types/app'

export const getNowEntries = cache(async (): Promise<NowEntry[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('now_entries')
    .select('*')
    .order('published_at', { ascending: false })
  return (data ?? []) as NowEntry[]
})

export const getLatestNowEntry = cache(async (): Promise<NowEntry | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('now_entries')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as NowEntry | null
})

export async function getAllNowAdmin(): Promise<NowEntry[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('now_entries')
    .select('*')
    .order('published_at', { ascending: false })
  return (data ?? []) as NowEntry[]
}

export async function getNowByIdAdmin(id: string): Promise<NowEntry | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('now_entries').select('*').eq('id', id).maybeSingle()
  return data as NowEntry | null
}
