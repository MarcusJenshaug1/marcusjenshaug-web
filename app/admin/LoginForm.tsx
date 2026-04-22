'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import {
  loginWithPassword,
  requestPasswordReset,
  type LoginState,
  type ResetState,
} from './actions'

const loginInitial: LoginState = {}
const resetInitial: ResetState = {}

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [loginState, loginAction, loginPending] = useActionState(loginWithPassword, loginInitial)
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, resetInitial)

  if (mode === 'reset') {
    if (resetState.success) {
      return (
        <div className="text-sm text-ink-2">
          <p className="mb-2">Sjekk e-posten din.</p>
          <p className="text-ink-3">
            Hvis adressen er autorisert, kommer det en reset-lenke i løpet av et minutt.
          </p>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="mt-4 text-sm text-ink-3 hover:text-ink underline decoration-rule-strong underline-offset-[3px]"
          >
            ← Tilbake til innlogging
          </button>
        </div>
      )
    }

    return (
      <form action={resetAction} noValidate>
        <p className="text-sm text-ink-3 mb-4">
          Skriv inn e-post så sender vi deg en lenke for å sette nytt passord.
        </p>
        <FormField label="E-post" htmlFor="reset-email" error={resetState.error}>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="du@eksempel.no"
          />
        </FormField>
        <Button type="submit" variant="primary" disabled={resetPending} className="w-full justify-center">
          {resetPending ? 'Sender …' : 'Send reset-lenke'}
        </Button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className="mt-4 block w-full text-center text-sm text-ink-3 hover:text-ink"
        >
          ← Tilbake til innlogging
        </button>
      </form>
    )
  }

  return (
    <form action={loginAction} noValidate>
      <FormField label="E-post" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="du@eksempel.no"
        />
      </FormField>
      <FormField label="Passord" htmlFor="password" error={loginState.error}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={loginPending} className="w-full justify-center">
        {loginPending ? 'Logger inn …' : 'Logg inn'}
      </Button>
      <button
        type="button"
        onClick={() => setMode('reset')}
        className="mt-4 block w-full text-center text-sm text-ink-3 hover:text-ink"
      >
        Glemt passord?
      </button>
    </form>
  )
}
