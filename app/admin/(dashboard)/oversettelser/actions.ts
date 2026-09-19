'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { TAGS } from '@/lib/cache-tags'
import { DICTIONARY, type DictionaryKey } from '@/lib/i18n/dictionaries'
import { LOCALES, type Locale } from '@/lib/i18n/config'
import { deleteUiStrings, getUiStringsAdmin, upsertUiString } from '@/lib/translations'

export type UiStringsState = {
  error?: string
  success?: boolean
  changed?: number
}

export async function saveUiStrings(_prev: UiStringsState, formData: FormData): Promise<UiStringsState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Ikke autorisert' }
  }

  const existing = new Map(
    (await getUiStringsAdmin()).map((row) => [`${row.locale}:${row.key}`, row.value])
  )
  const keys = Object.keys(DICTIONARY.nb) as DictionaryKey[]

  const upserts: { key: string; locale: Locale; value: string }[] = []
  const deletions: Record<Locale, string[]> = { nb: [], en: [] }

  for (const locale of LOCALES) {
    for (const key of keys) {
      const raw = formData.get(`${locale}:${key}`)
      if (typeof raw !== 'string') continue
      const value = raw.trim()
      const fallback: string = DICTIONARY[locale][key]
      const current = existing.get(`${locale}:${key}`)
      if (!value || value === fallback) {
        if (current !== undefined) deletions[locale].push(key)
      } else if (current !== value) {
        upserts.push({ key, locale, value })
      }
    }
  }

  try {
    for (const row of upserts) await upsertUiString(row.key, row.locale, row.value)
    for (const locale of LOCALES) await deleteUiStrings(locale, deletions[locale])
  } catch (e) {
    return { error: 'Kunne ikke lagre: ' + (e instanceof Error ? e.message : String(e)) }
  }

  revalidateTag(TAGS.ui)
  revalidatePath('/admin/oversettelser')
  return { success: true, changed: upserts.length + deletions.nb.length + deletions.en.length }
}
