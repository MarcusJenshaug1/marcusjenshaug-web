'use server'

import { Resend } from 'resend'
import { checkRateLimit, getClientIp, recordRateLimitHit } from '@/lib/rate-limit'
import { DEFAULT_LOCALE, getTranslator, isLocale, type Locale } from '@/lib/i18n'
import { parseContact, type ContactFieldErrors } from './schema'

export type ContactState = {
  fieldErrors?: ContactFieldErrors
  error?: string
  success?: boolean
}

const LIMIT = 5
const WINDOW_MINUTES = 1

// Bindes med locale fra skjemaet: sendContactMessage.bind(null, locale).
export async function sendContactMessage(
  localeArg: Locale,
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const locale = isLocale(localeArg) ? localeArg : DEFAULT_LOCALE
  const t = await getTranslator(locale)
  const { data, fieldErrors } = parseContact(formData)

  if (!data) {
    return { fieldErrors }
  }

  if (data.website) {
    return { success: true }
  }

  const bucket = `contact:${await getClientIp()}`
  const { allowed } = await checkRateLimit(bucket, LIMIT, WINDOW_MINUTES, { record: false })
  if (!allowed) {
    return { error: t('contact.form.error.rateLimit') }
  }

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return { error: t('contact.form.error.generic') }
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
    return { error: t('contact.form.error.generic') }
  }

  await recordRateLimitHit(bucket)

  return { success: true }
}
