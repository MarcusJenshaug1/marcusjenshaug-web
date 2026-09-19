import { z } from 'zod'

// Feilmeldingene er ordboksnøkler; action og skjema oversetter dem selv.
export const CONTACT_ERROR_KEYS = [
  'contact.form.error.name',
  'contact.form.error.nameLong',
  'contact.form.error.email',
  'contact.form.error.message',
  'contact.form.error.messageLong',
] as const

export type ContactErrorKey = (typeof CONTACT_ERROR_KEYS)[number]

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'contact.form.error.name').max(200, 'contact.form.error.nameLong'),
  email: z.string().trim().email('contact.form.error.email'),
  message: z
    .string()
    .trim()
    .min(10, 'contact.form.error.message')
    .max(5000, 'contact.form.error.messageLong'),
  website: z.string().optional().default(''),
})

export type ContactField = 'name' | 'email' | 'message'
export type ContactFieldErrors = Partial<Record<ContactField, ContactErrorKey>>

function asErrorKey(message: string | undefined): ContactErrorKey | undefined {
  return CONTACT_ERROR_KEYS.find((key) => key === message)
}

export function parseContact(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    message: formData.get('message') ?? '',
    website: formData.get('website') ?? '',
  })
  if (parsed.success) return { data: parsed.data, fieldErrors: null }

  const flat = parsed.error.flatten().fieldErrors
  const fieldErrors: ContactFieldErrors = {
    name: asErrorKey(flat.name?.[0]),
    email: asErrorKey(flat.email?.[0]),
    message: asErrorKey(flat.message?.[0]),
  }
  return { data: null, fieldErrors }
}
