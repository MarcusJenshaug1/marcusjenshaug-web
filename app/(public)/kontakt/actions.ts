'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const contactSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(200),
  email: z.string().email('Ugyldig e-post'),
  message: z.string().min(10, 'Meldingen må være minst 10 tegn').max(5000),
  website: z.string().max(0, 'Fjern verdien i dette feltet').optional().default(''),
})

export type ContactState = {
  error?: string
  success?: boolean
}

const LIMIT = 5
const WINDOW_MINUTES = 1

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.website) {
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

  await admin.from('rate_limits').insert({ bucket })

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return { error: 'E-posttjeneste ikke konfigurert.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'Kontaktskjema <kontakt@marcusjenshaug.no>',
    to: process.env.ADMIN_EMAIL,
    replyTo: parsed.data.email,
    subject: `Ny melding fra ${parsed.data.name}`,
    text: `Fra: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  })

  if (error) {
    return { error: 'Kunne ikke sende melding. Prøv igjen senere.' }
  }

  return { success: true }
}
