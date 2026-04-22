'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  username: z.string().optional(),
})

const settingsSchema = z.object({
  full_name: z.string().min(1, 'Navn er påkrevd'),
  headline: z.string().min(1, 'Tittel er påkrevd'),
  bio_short: z.string().min(1, 'Kort bio er påkrevd'),
  bio_long: z.string().min(1, 'Lang bio er påkrevd'),
  email: z.string().email('Ugyldig e-post'),
  location: z.string().optional(),
  available_for_work: z.boolean(),
  availability_note: z.string().optional(),
  cv_url: z.string().url().or(z.literal('')),
  image_url: z.string(),
  social_links: z.array(socialLinkSchema),
})

export type SettingsState = {
  error?: string
  success?: boolean
}

export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Ikke autorisert' }
  }

  const socialLinksRaw = formData.get('social_links')
  let socialLinks: unknown = []
  if (typeof socialLinksRaw === 'string' && socialLinksRaw.length > 0) {
    try {
      socialLinks = JSON.parse(socialLinksRaw)
    } catch {
      return { error: 'Ugyldig format på sosiale lenker' }
    }
  }

  const parsed = settingsSchema.safeParse({
    full_name: formData.get('full_name'),
    headline: formData.get('headline'),
    bio_short: formData.get('bio_short'),
    bio_long: formData.get('bio_long'),
    email: formData.get('email'),
    location: formData.get('location') || undefined,
    available_for_work: formData.get('available_for_work') === 'on',
    availability_note: formData.get('availability_note')?.toString() || undefined,
    cv_url: formData.get('cv_url')?.toString() || '',
    image_url: formData.get('image_url')?.toString() || '/portrett.jpg',
    social_links: socialLinks,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('site_settings')
    .update({
      ...parsed.data,
      cv_url: parsed.data.cv_url || null,
      availability_note: parsed.data.availability_note || null,
      location: parsed.data.location || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) {
    return { error: 'Kunne ikke lagre. Prøv igjen.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
