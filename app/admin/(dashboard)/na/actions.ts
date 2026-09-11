'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanEmDashes } from '@/lib/text'

const nowSchema = z.object({
  content: z.string().min(1, 'Innhold er påkrevd'),
  published_at: z.string().optional().default(''),
})

export type NowFormState = {
  error?: string
  success?: boolean
}

function parseForm(formData: FormData) {
  const publishedAtIso = formData.get('published_at_iso')
  return nowSchema.safeParse({
    content: formData.get('content'),
    published_at: (typeof publishedAtIso === 'string' && publishedAtIso) || formData.get('published_at') || '',
  })
}

function toDbValues(data: z.infer<typeof nowSchema>) {
  let published_at = new Date().toISOString()
  if (data.published_at) {
    const d = new Date(data.published_at)
    if (!isNaN(d.getTime())) published_at = d.toISOString()
  }
  return cleanEmDashes({
    content: data.content,
    published_at,
  })
}

export async function createNowEntry(
  _prev: NowFormState,
  formData: FormData
): Promise<NowFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('now_entries').insert(toDbValues(parsed.data))

  if (error) {
    return { error: 'Kunne ikke publisere: ' + error.message }
  }

  revalidatePath('/na')
  revalidatePath('/admin/na')
  revalidatePath('/')
  return { success: true }
}

export async function updateNowEntry(
  id: string,
  _prev: NowFormState,
  formData: FormData
): Promise<NowFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('now_entries').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidatePath('/na')
  revalidatePath('/admin/na')
  revalidatePath('/')
  return { success: true }
}

export async function deleteNowEntry(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('now_entries').delete().eq('id', id)
  if (error) throw new Error('Kunne ikke slette oppføringen: ' + error.message)
  revalidatePath('/na')
  revalidatePath('/admin/na')
  revalidatePath('/')
  redirect('/admin/na')
}
