'use client'

import { useActionState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { requestMagicLink, type LoginState } from './actions'

const initial: LoginState = {}

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial)

  if (state.success) {
    return (
      <div className="text-sm text-ink-2">
        <p className="mb-2">Sjekk e-posten din.</p>
        <p className="text-ink-3">
          Hvis adressen er autorisert, kommer det en innloggingslenke i løpet av et minutt.
        </p>
      </div>
    )
  }

  return (
    <form action={action} noValidate>
      <FormField label="E-post" htmlFor="email" error={state.error}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="du@eksempel.no"
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending} className="w-full justify-center">
        {pending ? 'Sender …' : 'Send innloggingslenke'}
      </Button>
    </form>
  )
}
