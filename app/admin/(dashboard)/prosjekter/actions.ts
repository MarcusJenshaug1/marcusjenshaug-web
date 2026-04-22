'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/slug'
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
  order_index: z.coerce.number().int().default(0),
  started_at: z.string().optional().default(''),
  ended_at: z.string().optional().default(''),
  draft: z.boolean(),
})

export type ProjectFormState = {
  error?: string
  success?: boolean
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Ikke autorisert')
  }
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
    order_index: formData.get('order_index') ?? 0,
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

  return {
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
    order_index: data.order_index,
    started_at: data.started_at || null,
    ended_at: data.ended_at || null,
    draft: data.draft,
    updated_at: new Date().toISOString(),
  }
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
  const { data, error } = await admin
    .from('projects')
    .insert(toDbValues(parsed.data))
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke opprette prosjekt: ' + error.message }
  }

  revalidatePath('/prosjekter')
  revalidatePath('/')
  redirect(`/admin/prosjekter/${data.id}?saved=1`)
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
  const { error } = await admin.from('projects').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidatePath(`/prosjekter/${parsed.data.slug}`)
  revalidatePath('/prosjekter')
  revalidatePath('/')
  return { success: true }
}

export async function autosaveProject(id: string, formData: FormData): Promise<{ error?: string } | void> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin.from('projects').update(toDbValues(parsed.data)).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/prosjekter/${id}`)
}

export async function togglePublish(id: string, currentDraft: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('projects').update({ draft: !currentDraft, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/prosjekter')
  revalidatePath('/admin/prosjekter')
  revalidatePath('/')
}

export async function deleteProject(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('projects').delete().eq('id', id)
  revalidatePath('/prosjekter')
  revalidatePath('/admin/prosjekter')
  revalidatePath('/')
  redirect('/admin/prosjekter')
}

export async function suggestSlug(title: string): Promise<string> {
  return slugify(title)
}
