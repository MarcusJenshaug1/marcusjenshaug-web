'use client'

import { useActionState, useState } from 'react'
import { FiArrowRight, FiMail } from 'react-icons/fi'
import {
  loginWithPassword,
  requestPasswordReset,
  type LoginState,
  type ResetState,
} from './actions'

const loginInitial: LoginState = {}
const resetInitial: ResetState = {}

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

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [loginState, loginAction, loginPending] = useActionState(loginWithPassword, loginInitial)
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, resetInitial)

  if (mode === 'reset' && resetState.success) {
    return (
      <div style={{ textAlign: 'center', padding: '.5rem 0' }}>
        <div
          style={{
            width: 40,
            height: 40,
            margin: '0 auto .875rem',
            borderRadius: '50%',
            background: 'oklch(0.94 0.06 145)',
            color: 'oklch(0.45 0.16 145)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiMail />
        </div>
        <h3 style={{ marginBottom: '.375rem' }}>Sjekk innboksen</h3>
        <p className="muted" style={{ fontSize: '.875rem' }}>
          Hvis adressen er autorisert, sendte vi en reset-lenke til{' '}
          <span className="mono">{email || 'e-posten din'}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode('login')
          }}
          className="btn btn-sm btn-ghost"
          style={{ marginTop: '.875rem' }}
        >
          ← Tilbake
        </button>
      </div>
    )
  }

  if (mode === 'reset') {
    return (
      <form action={resetAction} noValidate>
        <label htmlFor="reset-email" style={labelStyle}>E-post</label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="du@eksempel.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1rem' }}
        />
        {resetState.error && (
          <p style={{ color: 'var(--accent)', fontSize: '.8125rem', marginBottom: '.75rem' }}>
            {resetState.error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={resetPending}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {resetPending ? 'Sender …' : (<>Send reset-lenke <FiArrowRight /></>)}
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className="dim"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            marginTop: '.875rem',
            fontSize: '.75rem',
            background: 'none',
            border: 0,
            cursor: 'pointer',
          }}
        >
          ← Tilbake til innlogging
        </button>
      </form>
    )
  }

  return (
    <form action={loginAction} noValidate>
      <label htmlFor="email" style={labelStyle}>E-post</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="du@eksempel.no"
        style={{ ...inputStyle, marginBottom: '1rem' }}
      />
      <label htmlFor="password" style={labelStyle}>Passord</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        style={{ ...inputStyle, marginBottom: '.75rem' }}
      />
      {loginState.error && (
        <p style={{ color: 'var(--accent)', fontSize: '.8125rem', marginBottom: '.75rem' }}>
          {loginState.error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loginPending}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {loginPending ? 'Logger inn …' : (<>Logg inn <FiArrowRight /></>)}
      </button>
      <button
        type="button"
        onClick={() => setMode('reset')}
        className="dim"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          marginTop: '.875rem',
          fontSize: '.75rem',
          background: 'none',
          border: 0,
          cursor: 'pointer',
        }}
      >
        Glemt passord?
      </button>
    </form>
  )
}
