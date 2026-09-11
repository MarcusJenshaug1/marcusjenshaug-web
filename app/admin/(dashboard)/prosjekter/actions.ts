'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { TAGS, projectTag } from '@/lib/cache-tags'
import { cleanEmDashes } from '@/lib/text'
import { PROJECT_STATUSES } from '@/lib/types/app'

const statusEnum = z.enum(PROJECT_STATUSES)

const projectSchema = z.object({
  slug: z.string().min(1, 'Slug er påkrevd').regex(/^[a-z0-9-]+$/, 'Kun små bokstaver, tall og bindestrek'),
  title: z.string().min(1, 'Tittel er påkrevd').max(200),
  description: z.string().min(1, 'Beskrivelse er påkrevd').max(500),
  content: z.string().min(1, 'Innhold er påkrevd'),
  cover_image: z.string().optional().default(''),
  tech_stack: z.string().optional().default(''),
  live_url: z.string().url().or(z.literal('')).optional().default(''),
  repo_url: z.string().url().or(z.literal('')).optional().default(''),
  role: z.string().optional().default(''),
  status: statusEnum,
  featured: z.boolean(),
  started_at: z.string().optional().default(''),
  ended_at: z.string().optional().default(''),
  draft: z.boolean(),
})

export type ProjectFormState = {
  error?: string
  success?: boolean
}

function parseForm(formData: FormData) {
  return projectSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    description: formData.get('description'),
    content: formData.get('content'),
    cover_image: formData.get('cover_image') ?? '',
    tech_stack: formData.get('tech_stack') ?? '',
    live_url: formData.get('live_url') ?? '',
    repo_url: formData.get('repo_url') ?? '',
    role: formData.get('role') ?? '',
    status: formData.get('status'),
    featured: formData.get('featured') === 'on',
    started_at: formData.get('started_at') ?? '',
    ended_at: formData.get('ended_at') ?? '',
    draft: formData.get('draft') === 'on',
  })
}

function toDbValues(data: z.infer<typeof projectSchema>) {
  const tech_stack = data.tech_stack
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return cleanEmDashes({
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
    cover_image: data.cover_image || null,
    tech_stack,
    live_url: data.live_url || null,
    repo_url: data.repo_url || null,
    role: data.role || null,
    status: data.status,
    featured: data.featured,
    started_at: data.started_at || null,
    ended_at: data.ended_at || null,
    draft: data.draft,
    updated_at: new Date().toISOString(),
  })
}

function revalidateProjects(...slugs: Array<string | null | undefined>) {
  revalidateTag(TAGS.projects)
  for (const slug of new Set(slugs)) {
    if (slug) revalidateTag(projectTag(slug))
  }
}

async function getCurrentSlug(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from('projects').select('slug').eq('id', id).maybeSingle()
  return data?.slug ?? null
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data: last } = await admin
    .from('projects')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()
  const order_index = (last?.order_index ?? -1) + 1

  const { data, error } = await admin
    .from('projects')
    .insert({ ...toDbValues(parsed.data), order_index })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke opprette prosjekt: ' + error.message }
  }

  revalidateProjects(parsed.data.slug)
  redirect(`/admin/prosjekter/${data.id}`)
}

export async function updateProject(
  id: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const previousSlug = await getCurrentSlug(admin, id)
  const { error } = await admin.from('projects').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidateProjects(previousSlug, parsed.data.slug)
  return { success: true }
}

export async function autosaveProject(id: string, formData: FormData): Promise<{ error?: string } | void> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const previousSlug = await getCurrentSlug(admin, id)
  const { error } = await admin.from('projects').update(toDbValues(parsed.data)).eq('id', id)
  if (error) return { error: error.message }
  revalidateProjects(previousSlug, parsed.data.slug)
  revalidatePath(`/admin/prosjekter/${id}`)
}

export async function togglePublish(id: string, currentDraft: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('projects')
    .update({ draft: !currentDraft, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('slug')
    .maybeSingle()
  if (error) throw new Error('Kunne ikke endre synlighet: ' + error.message)
  revalidateProjects(data?.slug)
  revalidatePath('/admin/prosjekter')
}

export async function deleteProject(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('projects')
    .delete()
    .eq('id', id)
    .select('slug')
    .maybeSingle()
  if (error) throw new Error('Kunne ikke slette prosjektet: ' + error.message)
  revalidateProjects(data?.slug)
  revalidatePath('/admin/prosjekter')
  redirect('/admin/prosjekter')
}

const reorderSchema = z.array(z.string().uuid()).min(1)

export async function reorderProjects(
  orderedIds: string[]
): Promise<{ error?: string } | void> {
  await requireAdmin()
  const parsed = reorderSchema.safeParse(orderedIds)
  if (!parsed.success) return { error: 'Ugyldig rekkefølge' }

  const admin = createAdminClient()
  const results = await Promise.all(
    parsed.data.map((id, index) =>
      admin.from('projects').update({ order_index: index }).eq('id', id)
    )
  )

  revalidateProjects()
  revalidatePath('/admin/prosjekter')

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: 'Kunne ikke lagre rekkefølge: ' + failed.error.message }
}
