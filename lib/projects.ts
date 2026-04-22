import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Project, ProjectStatus } from '@/lib/types/app'

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('draft', false)
    .order('featured', { ascending: false })
    .order('order_index', { ascending: true })
    .order('started_at', { ascending: false, nullsFirst: false })
  return (data ?? []) as Project[]
})

export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('draft', false)
    .eq('featured', true)
    .order('order_index', { ascending: true })
  return (data ?? []) as Project[]
})

export const getProjectBySlug = cache(async (slug: string, preview = false): Promise<Project | null> => {
  if (preview) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === process.env.ADMIN_EMAIL) {
      const admin = createAdminClient()
      const { data } = await admin.from('projects').select('*').eq('slug', slug).maybeSingle()
      return data as Project | null
    }
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .maybeSingle()
  return data as Project | null
})

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  return (data ?? []) as Project[]
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('projects').select('*').eq('id', id).maybeSingle()
  return data as Project | null
}

export function countByStatus(projects: Project[]): Record<ProjectStatus | 'alle', number> {
  const counts: Record<ProjectStatus | 'alle', number> = {
    alle: projects.length,
    'aktiv': 0,
    'i-drift': 0,
    'side': 0,
    'arkivert': 0,
    'levert': 0,
  }
  for (const p of projects) counts[p.status]++
  return counts
}
