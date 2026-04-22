'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Ikke autorisert')
  }
}

function parseForm(formData: FormData) {
  return postSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    description: formData.get('description'),
    content: formData.get('content'),
    cover_image: formData.get('cover_image') ?? '',
    tags: formData.get('tags') ?? '',
    published_at: formData.get('published_at') ?? '',
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

  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
    cover_image: data.cover_image || null,
    tags,
    published_at,
    draft: data.draft,
    updated_at: new Date().toISOString(),
  }
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

  revalidatePath('/blogg')
  revalidatePath('/')
  redirect(`/admin/blogg/${data.id}?saved=1`)
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
  const { error } = await admin.from('posts').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Slug er allerede i bruk' }
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidatePath(`/blogg/${parsed.data.slug}`)
  revalidatePath('/blogg')
  revalidatePath('/')
  revalidatePath('/rss.xml')
  revalidatePath('/feed.json')
  return { success: true }
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
  await admin.from('posts').update(patch).eq('id', id)
  revalidatePath('/blogg')
  revalidatePath('/admin/blogg')
  revalidatePath('/')
}

export async function deletePost(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('posts').delete().eq('id', id)
  revalidatePath('/blogg')
  revalidatePath('/admin/blogg')
  revalidatePath('/')
  redirect('/admin/blogg')
}
