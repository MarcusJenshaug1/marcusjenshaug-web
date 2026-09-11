import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Post } from '@/lib/types/app'

export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
})

export const getLatestPosts = cache(async (limit = 4): Promise<Post[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Post[]
})

export const getPostBySlug = cache(async (slug: string, preview = false): Promise<Post | null> => {
  if (preview) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === process.env.ADMIN_EMAIL) {
      const admin = createAdminClient()
      const { data, error } = await admin.from('posts').select('*').eq('slug', slug).maybeSingle()
      if (error) throw error
      return data as Post | null
    }
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .maybeSingle()
  if (error) throw error
  return data as Post | null
})

export async function getAllPostsAdmin(): Promise<Post[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('posts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Post | null
}
