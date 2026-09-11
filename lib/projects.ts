import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/requireAdmin'
import { CACHE_REVALIDATE_SECONDS, TAGS, projectTag } from '@/lib/cache-tags'
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/lib/types/app'

export const getPublishedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('draft', false)
      .order('order_index', { ascending: true })
      .order('started_at', { ascending: false, nullsFirst: false })
    if (error) throw error
    return (data ?? []) as Project[]
  },
  ['published-projects'],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.projects] }
)

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getPublishedProjects()
  return all.filter((p) => p.featured)
}

function getCachedProjectBySlug(slug: string): Promise<Project | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('draft', false)
        .maybeSingle()
      if (error) throw error
      return data as Project | null
    },
    ['project-by-slug', slug],
    { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.projects, projectTag(slug)] }
  )()
}

export const getProjectBySlug = cache(async (slug: string, preview = false): Promise<Project | null> => {
  if (preview && (await isAdmin())) {
    const admin = createAdminClient()
    const { data, error } = await admin.from('projects').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data as Project | null
  }
  return getCachedProjectBySlug(slug)
})

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Project | null
}

export function countByStatus(projects: Project[]): Record<ProjectStatus | 'alle', number> {
  const counts = { alle: projects.length } as Record<ProjectStatus | 'alle', number>
  for (const s of PROJECT_STATUSES) counts[s] = 0
  for (const p of projects) {
    if (p.status in counts) counts[p.status]++
  }
  return counts
}

export async function getAdjacentProjects(slug: string): Promise<{
  prev: Project | null
  next: Project | null
}> {
  const all = await getPublishedProjects()
  if (all.length < 2) return { prev: null, next: null }
  const index = all.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }
  const prev = all[(index - 1 + all.length) % all.length]
  const next = all[(index + 1) % all.length]
  return { prev, next }
}
