'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { TAGS, postTag } from '@/lib/cache-tags'
import { cleanEmDashes } from '@/lib/text'

const postSchema = z.object({
  slug: z.string().min(1, 'Slug er påkrevd').regex(/^[a-z0-9-]+$/, 'Kun små bokstaver, tall og bindestrek'),
  title: z.string().min(1, 'Tittel er påkrevd').max(200),
  description: z.string().min(1, 'Beskrivelse er påkrevd').max(500),
  content: z.string().min(1, 'Innhold er påkrevd'),
  cover_image: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  published_at: z.string().optional().default(''),
  draft: z.boolean(),
})

export type PostFormState = {
  error?: string
  success?: boolean
}

function parseForm(formData: FormData) {
  const publishedAtIso = formData.get('published_at_iso')
  return postSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    description: formData.get('description'),
    content: formData.get('content'),
    cover_image: formData.get('cover_image') ?? '',
    tags: formData.get('tags') ?? '',
    published_at: (typeof publishedAtIso === 'string' && publishedAtIso) || formData.get('published_at') || '',
    draft: formData.get('draft') === 'on',
  })
}

function toDbValues(data: z.infer<typeof postSchema>) {
  const tags = data.tags.split(',').map((s) => s.trim()).filter(Boolean)
  let published_at: string | null = null
  if (data.published_at) {
    const d = new Date(data.published_at)
    if (!isNaN(d.getTime())) published_at = d.toISOString()
  } else if (!data.draft) {
    published_at = new Date().toISOString()
  }

  return cleanEmDashes({
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
    cover_image: data.cover_image || null,
    tags,
    published_at,
    draft: data.draft,
    updated_at: new Date().toISOString(),
  })
}

function revalidatePosts(...slugs: Array<string | null | undefined>) {
  revalidateTag(TAGS.posts)
  for (const slug of new Set(slugs)) {
    if (slug) revalidateTag(postTag(slug))
  }
}

async function getCurrentSlug(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from('posts').select('slug').eq('id', id).maybeSingle()
  return data?.slug ?? null
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .insert(toDbValues(parsed.data))
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke opprette: ' + error.message }
  }

  revalidatePosts(parsed.data.slug)
  redirect(`/admin/blogg/${data.id}`)
}

export async function updatePost(
  id: string,
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const previousSlug = await getCurrentSlug(admin, id)
  const { error } = await admin.from('posts').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidatePosts(previousSlug, parsed.data.slug)
  return { success: true }
}

export async function autosavePost(id: string, formData: FormData): Promise<{ error?: string } | void> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const previousSlug = await getCurrentSlug(admin, id)
  const { error } = await admin.from('posts').update(toDbValues(parsed.data)).eq('id', id)
  if (error) return { error: error.message }
  revalidatePosts(previousSlug, parsed.data.slug)
  revalidatePath(`/admin/blogg/${id}`)
}

export async function togglePublish(id: string, currentDraft: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  const patch: { draft: boolean; updated_at: string; published_at?: string } = {
    draft: !currentDraft,
    updated_at: new Date().toISOString(),
  }
  if (currentDraft) {
    patch.published_at = new Date().toISOString()
  }
  const { data, error } = await admin
    .from('posts')
    .update(patch)
    .eq('id', id)
    .select('slug')
    .maybeSingle()
  if (error) throw new Error('Kunne ikke endre synlighet: ' + error.message)
  revalidatePosts(data?.slug)
  revalidatePath('/admin/blogg')
}

export async function deletePost(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .delete()
    .eq('id', id)
    .select('slug')
    .maybeSingle()
  if (error) throw new Error('Kunne ikke slette innlegget: ' + error.message)
  revalidatePosts(data?.slug)
  revalidatePath('/admin/blogg')
  redirect('/admin/blogg')
}
