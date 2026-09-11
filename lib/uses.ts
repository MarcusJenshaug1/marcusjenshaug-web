import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
import type { UsesItem } from '@/lib/types/app'

export const getUsesItems = unstable_cache(
  async (): Promise<UsesItem[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('uses_items')
      .select('*')
      .order('category', { ascending: true })
      .order('order_index', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []) as UsesItem[]
  },
  ['uses-items'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.uses] }
)

export function groupByCategory(items: UsesItem[]): Record<string, UsesItem[]> {
  const groups: Record<string, UsesItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

export async function getAllUsesAdmin(): Promise<UsesItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('uses_items')
    .select('*')
    .order('category', { ascending: true })
    .order('order_index', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as UsesItem[]
}

export async function getUsesItemByIdAdmin(id: string): Promise<UsesItem | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('uses_items').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as UsesItem | null
}
