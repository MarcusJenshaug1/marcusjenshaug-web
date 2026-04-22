'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanEmDashes } from '@/lib/text'

const usesSchema = z.object({
  category: z.string().min(1, 'Kategori er påkrevd').max(100),
  name: z.string().min(1, 'Navn er påkrevd').max(200),
  description: z.string().optional().default(''),
  url: z.string().url().or(z.literal('')).optional().default(''),
  order_index: z.coerce.number().int().default(0),
})

export type UsesFormState = {
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
  return usesSchema.safeParse({
    category: formData.get('category'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    url: formData.get('url') ?? '',
    order_index: formData.get('order_index') ?? 0,
  })
}

function toDbValues(data: z.infer<typeof usesSchema>) {
  return cleanEmDashes({
    category: data.category,
    name: data.name,
    description: data.description || null,
    url: data.url || null,
    order_index: data.order_index,
    updated_at: new Date().toISOString(),
  })
}

export async function createUsesItem(
  _prev: UsesFormState,
  formData: FormData
): Promise<UsesFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('uses_items').insert(toDbValues(parsed.data))

  if (error) {
    return { error: 'Kunne ikke opprette: ' + error.message }
  }

  revalidatePath('/uses')
  revalidatePath('/admin/uses')
  return { success: true }
}

export async function updateUsesItem(
  id: string,
  _prev: UsesFormState,
  formData: FormData
): Promise<UsesFormState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('uses_items').update(toDbValues(parsed.data)).eq('id', id)

  if (error) {
    return { error: 'Kunne ikke lagre: ' + error.message }
  }

  revalidatePath('/uses')
  revalidatePath('/admin/uses')
  return { success: true }
}

export async function deleteUsesItem(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('uses_items').delete().eq('id', id)
  revalidatePath('/uses')
  revalidatePath('/admin/uses')
  redirect('/admin/uses')
}

export async function reorderUsesItem(id: string, delta: number) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: current } = await admin.from('uses_items').select('order_index').eq('id', id).maybeSingle()
  if (!current) return
  await admin
    .from('uses_items')
    .update({ order_index: current.order_index + delta, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/uses')
  revalidatePath('/admin/uses')
}
