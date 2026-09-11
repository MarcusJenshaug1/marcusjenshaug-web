'use client'

import { useActionState, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiMail } from 'react-icons/fi'
import { Button } from '@/components/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import {
  loginWithPassword,
  requestPasswordReset,
  type LoginState,
  type ResetState,
} from './actions'

const loginInitial: LoginState = {}
const resetInitial: ResetState = {}

const linkButtonClass = 'block w-full text-center mt-3.5 text-xs text-ink-4 hover:text-ink transition-colors cursor-pointer'

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [loginState, loginAction] = useActionState(loginWithPassword, loginInitial)
  const [resetState, resetAction] = useActionState(requestPasswordReset, resetInitial)

  if (mode === 'reset' && resetState.success) {
    return (
      <div className="text-center py-2">
        <div
          className="w-10 h-10 mx-auto mb-3.5 rounded-full inline-flex items-center justify-center"
          style={{ background: 'oklch(0.94 0.06 145)', color: 'oklch(0.45 0.16 145)' }}
        >
          <FiMail aria-hidden />
        </div>
        <h3 className="mb-1.5">Sjekk innboksen</h3>
        <p className="muted text-sm">
          Hvis adressen er autorisert, sendte vi en reset-lenke til{' '}
          <span className="mono">{email || 'e-posten din'}</span>.
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setMode('login')} className="mt-3.5">
          <FiArrowLeft aria-hidden /> Tilbake
        </Button>
      </div>
    )
  }

  if (mode === 'reset') {
    return (
      <form action={resetAction} noValidate>
        <FormField label="E-post" htmlFor="reset-email" error={resetState.error}>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="du@eksempel.no"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <SubmitButton pendingLabel="Sender …" className="w-full justify-center">
          Send reset-lenke <FiArrowRight aria-hidden />
        </SubmitButton>
        <button type="button" onClick={() => setMode('login')} className={linkButtonClass}>
          <FiArrowLeft aria-hidden className="inline align-[-2px]" /> Tilbake til innlogging
        </button>
      </form>
    )
  }

  return (
    <form action={loginAction} noValidate>
      <FormField label="E-post" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="du@eksempel.no" />
      </FormField>
      <FormField label="Passord" htmlFor="password" error={loginState.error}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FormField>
      <SubmitButton pendingLabel="Logger inn …" className="w-full justify-center">
        Logg inn <FiArrowRight aria-hidden />
      </SubmitButton>
      <button type="button" onClick={() => setMode('reset')} className={linkButtonClass}>
        Glemt passord?
      </button>
    </form>
  )
}
