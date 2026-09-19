'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { TAGS, postTag, projectTag } from '@/lib/cache-tags'
import { cleanEmDashes } from '@/lib/text'
import { suggestSlug, translateFields } from '@/lib/translate'
import { upsertTranslation } from '@/lib/translations'
import type { ContentEntity } from '@/lib/types/app'

export type TranslationFields = {
  slug: string
  title: string
  description: string
  content: string
  role: string
}

export type TranslationState = {
  error?: string
  success?: boolean
}

export type AiTranslateResult = { fields: TranslationFields } | { error: string }

const translationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]*$/, 'Kun små bokstaver, tall og bindestrek').default(''),
  title: z.string().max(200).default(''),
  description: z.string().max(500).default(''),
  content: z.string().default(''),
  role: z.string().max(200).default(''),
})

const ADMIN_PATH: Record<ContentEntity, string> = {
  posts: '/admin/blogg',
  projects: '/admin/prosjekter',
  now_entries: '/admin/na',
  uses_items: '/admin/uses',
}

const ENTITY_TAG: Record<ContentEntity, string> = {
  posts: TAGS.posts,
  projects: TAGS.projects,
  now_entries: TAGS.now,
  uses_items: TAGS.uses,
}

function revalidate(entity: ContentEntity, entityId: string, sourceSlug: string | null) {
  revalidateTag(TAGS.translations)
  revalidateTag(ENTITY_TAG[entity])
  if (sourceSlug && entity === 'posts') revalidateTag(postTag(sourceSlug))
  if (sourceSlug && entity === 'projects') revalidateTag(projectTag(sourceSlug))
  revalidatePath(ADMIN_PATH[entity])
  revalidatePath(`${ADMIN_PATH[entity]}/${entityId}`)
}

type SourceRow = {
  slug: string | null
  title: string
  description: string
  content: string
  role: string
}

async function readSource(entity: ContentEntity, entityId: string): Promise<SourceRow | null> {
  const admin = createAdminClient()
  if (entity === 'posts') {
    const { data } = await admin.from('posts').select('slug, title, description, content').eq('id', entityId).maybeSingle()
    if (!data) return null
    return { ...data, role: '' }
  }
  if (entity === 'projects') {
    const { data } = await admin.from('projects').select('slug, title, description, content, role').eq('id', entityId).maybeSingle()
    if (!data) return null
    return { ...data, role: data.role ?? '' }
  }
  if (entity === 'now_entries') {
    const { data } = await admin.from('now_entries').select('content').eq('id', entityId).maybeSingle()
    if (!data) return null
    return { slug: null, title: '', description: '', content: data.content, role: '' }
  }
  const { data } = await admin.from('uses_items').select('name, description').eq('id', entityId).maybeSingle()
  if (!data) return null
  return { slug: null, title: data.name, description: data.description ?? '', content: '', role: '' }
}

export async function saveTranslation(
  entity: ContentEntity,
  entityId: string,
  _prev: TranslationState,
  formData: FormData
): Promise<TranslationState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Ikke autorisert' }
  }

  const parsed = translationSchema.safeParse({
    slug: formData.get('slug') ?? '',
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    content: formData.get('content') ?? '',
    role: formData.get('role') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const source = await readSource(entity, entityId)
  if (!source) return { error: 'Fant ikke den norske raden' }

  try {
    await upsertTranslation({
      entity,
      entity_id: entityId,
      locale: 'en',
      ...cleanEmDashes({
        slug: parsed.data.slug || null,
        title: parsed.data.title || null,
        description: parsed.data.description || null,
        content: parsed.data.content || null,
        role: parsed.data.role || null,
      }),
      machine_translated: false,
    })
  } catch (e) {
    const code = (e as { code?: string }).code
    if (code === '23505') return { error: 'Engelsk slug er allerede i bruk' }
    return { error: 'Kunne ikke lagre oversettelsen: ' + (e instanceof Error ? e.message : String(e)) }
  }

  revalidate(entity, entityId, source.slug)
  return { success: true }
}

export async function aiTranslate(entity: ContentEntity, entityId: string): Promise<AiTranslateResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Ikke autorisert' }
  }

  const source = await readSource(entity, entityId)
  if (!source) return { error: 'Fant ikke den norske raden' }

  const input: Record<string, string> = {}
  if (entity === 'posts' || entity === 'projects' || entity === 'uses_items') {
    input.title = source.title
    input.description = source.description
  }
  if (entity !== 'uses_items') input.content = source.content
  if (entity === 'projects') input.role = source.role

  let translated: Record<string, string>
  try {
    translated = await translateFields(input, { entity, sourceLocale: 'nb', targetLocale: 'en' })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Oversetting feilet' }
  }

  const fields: TranslationFields = cleanEmDashes({
    slug: source.slug ? suggestSlug(translated.title ?? '') : '',
    title: translated.title ?? '',
    description: translated.description ?? '',
    content: translated.content ?? '',
    role: translated.role ?? '',
  })

  const base = {
    entity,
    entity_id: entityId,
    locale: 'en' as const,
    title: fields.title || null,
    description: fields.description || null,
    content: fields.content || null,
    role: fields.role || null,
    machine_translated: true,
  }
  const candidates = fields.slug ? [fields.slug, `${fields.slug}-2`] : ['']
  let saved = false
  for (const slug of candidates) {
    try {
      await upsertTranslation({ ...base, slug: slug || null })
      fields.slug = slug
      saved = true
      break
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code !== '23505') return { error: 'Kunne ikke lagre oversettelsen: ' + (e instanceof Error ? e.message : String(e)) }
    }
  }
  if (!saved) return { error: 'Engelsk slug er allerede i bruk' }

  revalidate(entity, entityId, source.slug)
  return { fields }
}

export type SettingsTranslation = {
  headline_en: string
  bio_short_en: string
  bio_long_en: string
  location_en: string
  availability_note_en: string
}

export type AiTranslateSettingsResult = { fields: SettingsTranslation } | { error: string }

export async function aiTranslateSettings(): Promise<AiTranslateSettingsResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Ikke autorisert' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('site_settings')
    .select('headline, bio_short, bio_long, location, availability_note')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data) return { error: 'Fant ikke innstillingene' }

  try {
    const t = await translateFields(
      {
        headline: data.headline,
        bio_short: data.bio_short,
        bio_long: data.bio_long,
        location: data.location ?? '',
        availability_note: data.availability_note ?? '',
      },
      { entity: 'site_settings', sourceLocale: 'nb', targetLocale: 'en' }
    )
    return {
      fields: cleanEmDashes({
        headline_en: t.headline,
        bio_short_en: t.bio_short,
        bio_long_en: t.bio_long,
        location_en: t.location,
        availability_note_en: t.availability_note,
      }),
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Oversetting feilet' }
  }
}
