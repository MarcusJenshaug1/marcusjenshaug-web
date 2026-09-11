import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/requireAdmin'
import { CACHE_REVALIDATE_SECONDS, TAGS, postTag } from '@/lib/cache-tags'
import type { Post } from '@/lib/types/app'

export const getPublishedPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('draft', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Post[]
  },
  ['published-posts'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.posts] }
)

function getCachedPostBySlug(slug: string): Promise<Post | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('draft', false)
        .lte('published_at', new Date().toISOString())
        .maybeSingle()
      if (error) throw error
      return data as Post | null
    },
    ['post-by-slug', slug],
    { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.posts, postTag(slug)] }
  )()
}

export const getPostBySlug = cache(async (slug: string, preview = false): Promise<Post | null> => {
  if (preview && (await isAdmin())) {
    const admin = createAdminClient()
    const { data, error } = await admin.from('posts').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data as Post | null
  }
  return getCachedPostBySlug(slug)
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
