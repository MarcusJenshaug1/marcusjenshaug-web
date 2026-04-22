'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(1, 'Passord er påkrevd'),
})

const resetSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Passordet må være minst 8 tegn'),
})

export type LoginState = {
  error?: string
}

export type ResetState = {
  error?: string
  success?: boolean
}

export type UpdatePasswordState = {
  error?: string
}

export async function loginWithPassword(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Feil e-post eller passord.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Feil e-post eller passord.' }
  }

  redirect('/admin/innstillinger')
}

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.email !== process.env.ADMIN_EMAIL) {
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/admin/reset`,
  })

  if (error) {
    return { error: 'Kunne ikke sende reset-lenke. Prøv igjen senere.' }
  }

  return { success: true }
}

export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get('password') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ingen aktiv sesjon. Start reset-flyten på nytt.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { error: 'Kunne ikke oppdatere passord. Prøv igjen.' }
  }

  redirect('/admin/innstillinger')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin')
}
