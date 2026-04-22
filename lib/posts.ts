import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Post } from '@/lib/types/app'

export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  return (data ?? []) as Post[]
})

export const getLatestPosts = cache(async (limit = 4): Promise<Post[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as Post[]
})

export const getPostBySlug = cache(async (slug: string, preview = false): Promise<Post | null> => {
  if (preview) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === process.env.ADMIN_EMAIL) {
      const admin = createAdminClient()
      const { data } = await admin.from('posts').select('*').eq('slug', slug).maybeSingle()
      return data as Post | null
    }
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .maybeSingle()
  return data as Post | null
})

export async function getAllPostsAdmin(): Promise<Post[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false })
  return (data ?? []) as Post[]
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('posts').select('*').eq('id', id).maybeSingle()
  return data as Post | null
}
