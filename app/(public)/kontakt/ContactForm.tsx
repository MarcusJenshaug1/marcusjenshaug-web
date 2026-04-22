'use client'

import { useActionState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { sendContactMessage, type ContactState } from './actions'

const initial: ContactState = {}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial)

  if (state.success) {
    return (
      <div className="bg-bg-elev border border-rule rounded-[10px] p-8">
        <h2 className="text-xl mb-2">Takk</h2>
        <p className="text-ink-3">
          Meldingen er mottatt. Jeg svarer på e-posten du oppga så snart jeg får sjansen.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="bg-bg-elev border border-rule rounded-[10px] p-6">
      <FormField label="Navn" htmlFor="name">
        <Input id="name" name="name" required autoComplete="name" />
      </FormField>
      <FormField label="E-post" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </FormField>
      <FormField label="Melding" htmlFor="message">
        <Textarea id="message" name="message" rows={6} required />
      </FormField>

      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>
          Ikke fyll ut dette feltet
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Sender …' : 'Send melding'}
        </Button>
        {state.error && <span className="text-sm text-accent">{state.error}</span>}
      </div>
    </form>
  )
}
