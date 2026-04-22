'use client'

import { useActionState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { updatePassword, type UpdatePasswordState } from '@/app/admin/actions'

const initial: UpdatePasswordState = {}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.8125rem',
  color: 'var(--ink-3)',
  marginBottom: '.375rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.5625rem .75rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '6px',
  background: 'var(--bg-elev)',
}

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, initial)

  return (
    <form action={action} noValidate>
      <label htmlFor="password" style={labelStyle}>Nytt passord</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        style={{ ...inputStyle, marginBottom: '.75rem' }}
      />
      {state.error && (
        <p style={{ color: 'var(--accent)', fontSize: '.8125rem', marginBottom: '.75rem' }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {pending ? 'Lagrer …' : (<>Lagre passord <FiArrowRight /></>)}
      </button>
      <p className="dim" style={{ fontSize: '.75rem', marginTop: '.875rem', textAlign: 'center', lineHeight: 1.5 }}>
        Minst 8 tegn. Etter lagring blir du sendt til admin-panelet.
      </p>
    </form>
  )
}
