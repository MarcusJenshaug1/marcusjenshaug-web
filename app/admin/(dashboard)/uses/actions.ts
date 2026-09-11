'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
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
  const { error } = await admin.from('uses_items').delete().eq('id', id)
  if (error) throw new Error('Kunne ikke slette oppføringen: ' + error.message)
  revalidatePath('/uses')
  revalidatePath('/admin/uses')
  redirect('/admin/uses')
}

const reorderSchema = z.object({
  id: z.string().uuid(),
  delta: z.number().int().min(-1).max(1),
})

export async function reorderUsesItem(id: string, delta: number) {
  await requireAdmin()
  const parsed = reorderSchema.safeParse({ id, delta })
  if (!parsed.success) throw new Error('Ugyldig flytting')

  const admin = createAdminClient()
  const { data: current, error: currentError } = await admin
    .from('uses_items')
    .select('category')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (currentError) throw new Error('Kunne ikke flytte: ' + currentError.message)
  if (!current) return

  const { data: siblings, error: siblingsError } = await admin
    .from('uses_items')
    .select('id, order_index')
    .eq('category', current.category)
    .order('order_index', { ascending: true })
    .order('name', { ascending: true })
  if (siblingsError) throw new Error('Kunne ikke flytte: ' + siblingsError.message)

  let ordered = siblings ?? []
  const hasDuplicates = new Set(ordered.map((s) => s.order_index)).size !== ordered.length
  if (hasDuplicates) {
    ordered = ordered.map((s, i) => ({ ...s, order_index: i }))
    const results = await Promise.all(
      ordered.map((s) => admin.from('uses_items').update({ order_index: s.order_index }).eq('id', s.id))
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) throw new Error('Kunne ikke normalisere rekkefølge: ' + failed.error.message)
  }

  const index = ordered.findIndex((s) => s.id === parsed.data.id)
  const neighbour = ordered[index + parsed.data.delta]
  if (index === -1 || !neighbour) return

  const now = new Date().toISOString()
  const [a, b] = await Promise.all([
    admin
      .from('uses_items')
      .update({ order_index: neighbour.order_index, updated_at: now })
      .eq('id', parsed.data.id),
    admin
      .from('uses_items')
      .update({ order_index: ordered[index].order_index, updated_at: now })
      .eq('id', neighbour.id),
  ])
  const swapError = a.error ?? b.error
  if (swapError) throw new Error('Kunne ikke flytte: ' + swapError.message)

  revalidatePath('/uses')
  revalidatePath('/admin/uses')
}
