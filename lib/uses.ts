import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UsesItem } from '@/lib/types/app'

export const getUsesItems = cache(async (): Promise<UsesItem[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('uses_items')
    .select('*')
    .order('category', { ascending: true })
    .order('order_index', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as UsesItem[]
})

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
