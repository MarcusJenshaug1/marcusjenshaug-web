import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Skriv inn navnet ditt').max(200, 'Navnet er for langt'),
  email: z.string().trim().email('Skriv inn en gyldig e-postadresse'),
  message: z
    .string()
    .trim()
    .min(10, 'Meldingen må være minst 10 tegn')
    .max(5000, 'Meldingen kan være maks 5000 tegn'),
  website: z.string().optional().default(''),
})

export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

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
    name: flat.name?.[0],
    email: flat.email?.[0],
    message: flat.message?.[0],
  }
  return { data: null, fieldErrors }
}
