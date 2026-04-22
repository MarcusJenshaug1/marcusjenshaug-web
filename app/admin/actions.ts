'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
})

export type LoginState = {
  error?: string
  success?: boolean
}

export async function requestMagicLink(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.email !== process.env.ADMIN_EMAIL) {
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/innstillinger`,
    },
  })

  if (error) {
    return { error: 'Kunne ikke sende magic link. Prøv igjen senere.' }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin')
}
