'use client'

import { useActionState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { sendContactMessage, type ContactState } from './actions'

const initial: ContactState = {}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '.5625rem .75rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '6px',
  background: 'var(--bg-elev)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.8125rem',
  color: 'var(--ink-3)',
  marginBottom: '.375rem',
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial)

  if (state.success) {
    return (
      <div style={{ padding: '2rem', border: '1px solid var(--rule)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-elev)' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'oklch(0.94 0.06 145)', color: 'oklch(0.45 0.16 145)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.75rem' }}>
          <FiCheck />
        </div>
        <h3>Takk — meldingen er sendt.</h3>
        <p className="muted" style={{ marginTop: '.375rem', fontSize: '.9375rem' }}>Jeg svarer så snart jeg kan.</p>
      </div>
    )
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name" style={labelStyle}>Navn</label>
        <input id="name" name="name" required autoComplete="name" style={fieldStyle} placeholder="Ola Nordmann" />
      </div>
      <div>
        <label htmlFor="email" style={labelStyle}>E-post</label>
        <input id="email" name="email" type="email" required autoComplete="email" style={fieldStyle} placeholder="ola@example.no" />
      </div>
      <div>
        <label htmlFor="message" style={labelStyle}>Melding</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Skriv fritt. Jeg leser alt."
          style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.55 }}
        />
      </div>
      <input type="text" name="website" tabIndex={-1} aria-hidden style={{ position: 'absolute', left: '-9999px' }} autoComplete="off" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.5rem' }}>
        <span className="dim" style={{ fontSize: '.75rem' }}>Beskyttet av honeypot + rate-limit.</span>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Sender …' : 'Send melding'} <FiArrowRight />
        </button>
      </div>
      {state.error && (
        <p style={{ color: 'var(--accent)', fontSize: '.875rem' }}>{state.error}</p>
      )}
    </form>
  )
}
