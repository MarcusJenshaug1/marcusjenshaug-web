import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { CACHE_REVALIDATE_SECONDS, TAGS } from '@/lib/cache-tags'
import { SOURCE_LOCALE, type Locale } from '@/lib/i18n/config'
import type { ContentEntity, ContentTranslation, NowEntry, Post, Project, UiString, UsesItem } from '@/lib/types/app'

type TranslationLocale = ContentTranslation['locale']

function asTranslationLocale(locale: Locale): TranslationLocale | null {
  return locale === 'en' ? 'en' : null
}

// Norsk bor i hovedtabellene. For andre språk hentes content_translations og
// flettes over: felt som er tomme i oversettelsen faller tilbake til norsk.
// `localized` sier om raden faktisk var oversatt, så sider kan vise et
// «kun på norsk»-merke, og `machineTranslated` om den ikke er gjennomgått.

export type Localized<T> = T & {
  locale: Locale
  sourceSlug: string
  localized: boolean
  machineTranslated: boolean
}

const getTranslationsFor = (entity: ContentEntity, locale: TranslationLocale) =>
  unstable_cache(
    async (): Promise<ContentTranslation[]> => {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        .from('content_translations')
        .select('*')
        .eq('entity', entity)
        .eq('locale', locale)
      // Før migrasjonen er kjørt finnes ikke tabellen; da vises norsk innhold.
      if (error?.code === 'PGRST205' || error?.code === '42P01') return []
      if (error) throw error
      return (data ?? []) as ContentTranslation[]
    },
    ['translations', entity, locale],
    { revalidate: CACHE_REVALIDATE_SECONDS, tags: [TAGS.translations, TAGS[entityTag(entity)]] }
  )()

function entityTag(entity: ContentEntity): 'posts' | 'projects' | 'now' | 'uses' {
  if (entity === 'now_entries') return 'now'
  if (entity === 'uses_items') return 'uses'
  return entity
}

type Sluggable = { slug: string }

function merge<T extends { id: string }>(row: T, locale: Locale, t: ContentTranslation | undefined): Localized<T> {
  const sourceSlug = (row as Partial<Sluggable>).slug ?? row.id
  if (locale === SOURCE_LOCALE || !t) {
    return { ...row, locale: SOURCE_LOCALE, sourceSlug, localized: locale === SOURCE_LOCALE, machineTranslated: false }
  }
  const out: Record<string, unknown> = { ...row }
  for (const key of ['slug', 'title', 'description', 'content', 'role'] as const) {
    const value = t[key]
    if (value && key in row) out[key] = value
  }
  // uses_items har «name» der oversettelsen lagrer «title».
  if (t.title && 'name' in row && !('title' in row)) out.name = t.title
  return { ...(out as T), locale, sourceSlug, localized: true, machineTranslated: t.machine_translated }
}

export async function localizeMany<T extends { id: string }>(
  entity: ContentEntity,
  rows: T[],
  locale: Locale
): Promise<Localized<T>[]> {
  const tl = asTranslationLocale(locale)
  if (!tl) return rows.map((r) => merge(r, locale, undefined))
  const translations = await getTranslationsFor(entity, tl)
  const byId = new Map(translations.map((t) => [t.entity_id, t]))
  return rows.map((r) => merge(r, locale, byId.get(r.id)))
}

export async function localizeOne<T extends { id: string }>(
  entity: ContentEntity,
  row: T,
  locale: Locale
): Promise<Localized<T>> {
  const [out] = await localizeMany(entity, [row], locale)
  return out
}

// Finner kilde-slug (norsk) fra en slug i et hvilket som helst språk, så
// /en/projects/<engelsk-slug> kan slå opp raden. Faller tilbake til samme slug.
export async function resolveSourceSlug(entity: ContentEntity, slug: string, locale: Locale, rows: (Sluggable & { id: string })[]): Promise<string> {
  const tl = asTranslationLocale(locale)
  if (!tl) return slug
  const translations = await getTranslationsFor(entity, tl)
  const hit = translations.find((t) => t.slug === slug)
  if (!hit) return slug
  return rows.find((r) => r.id === hit.entity_id)?.slug ?? slug
}

export async function getTranslationAdmin(entity: ContentEntity, entityId: string, locale: TranslationLocale) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('content_translations')
    .select('*')
    .eq('entity', entity)
    .eq('entity_id', entityId)
    .eq('locale', locale)
    .maybeSingle()
  if (error) throw error
  return data as ContentTranslation | null
}

export type LocalizedPost = Localized<Post>
export type LocalizedProject = Localized<Project>
export type LocalizedNow = Localized<NowEntry>
export type LocalizedUses = Localized<UsesItem>

// Admin-skriving. Kun fra server actions (service role).

export type TranslationUpsert = {
  entity: ContentEntity
  entity_id: string
  locale: ContentTranslation['locale']
  slug?: string | null
  title?: string | null
  description?: string | null
  content?: string | null
  role?: string | null
  machine_translated: boolean
}

export async function getTranslationsAdmin(entity: ContentEntity, locale: ContentTranslation['locale']): Promise<Map<string, ContentTranslation>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('content_translations')
    .select('*')
    .eq('entity', entity)
    .eq('locale', locale)
  if (error) throw error
  return new Map(((data ?? []) as ContentTranslation[]).map((t) => [t.entity_id, t]))
}

export async function upsertTranslation(input: TranslationUpsert): Promise<ContentTranslation> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('content_translations')
    .upsert(
      {
        ...input,
        slug: input.slug || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'entity,entity_id,locale' }
    )
    .select('*')
    .single()
  if (error) throw error
  return data as ContentTranslation
}

export async function getUiStringsAdmin(): Promise<UiString[]> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('ui_strings').select('*')
  if (error) throw error
  return (data ?? []) as UiString[]
}

export async function upsertUiString(key: string, locale: Locale, value: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('ui_strings')
    .upsert({ key, locale, value, updated_at: new Date().toISOString() }, { onConflict: 'key,locale' })
  if (error) throw error
}

export async function deleteUiStrings(locale: Locale, keys: string[]): Promise<void> {
  if (keys.length === 0) return
  const admin = createAdminClient()
  const { error } = await admin.from('ui_strings').delete().eq('locale', locale).in('key', keys)
  if (error) throw error
}
