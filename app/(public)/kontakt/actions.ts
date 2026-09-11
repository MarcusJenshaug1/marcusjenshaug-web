'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseContact, type ContactFieldErrors } from './schema'

export type ContactState = {
  fieldErrors?: ContactFieldErrors
  error?: string
  success?: boolean
}

const LIMIT = 5
const WINDOW_MINUTES = 1

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const { data, fieldErrors } = parseContact(formData)

  if (!data) {
    return { fieldErrors }
  }

  if (data.website) {
    return { success: true }
  }

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'unknown'

  const bucket = `contact:${ip}`
  const admin = createAdminClient()
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count } = await admin
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .gte('created_at', since)

  if ((count ?? 0) >= LIMIT) {
    return { error: 'For mange forespørsler. Prøv igjen om et minutt.' }
  }

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return { error: 'E-posttjeneste ikke konfigurert.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'Kontaktskjema <kontakt@marcusjenshaug.no>',
    to: process.env.ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Ny melding fra ${data.name}`,
    text: `Fra: ${data.name} <${data.email}>\n\n${data.message}`,
  })

  if (error) {
    return { error: 'Kunne ikke sende melding. Prøv igjen senere.' }
  }

  await admin.from('rate_limits').insert({ bucket })

  return { success: true }
}
