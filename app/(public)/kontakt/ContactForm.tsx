'use client'

import { useActionState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { Magnetic } from '@/components/motion/Magnetic'
import { useSound } from '@/components/motion/SoundProvider'
import { sendContactMessage, type ContactState } from './actions'

const initial: ContactState = {}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial)
  const { play } = useSound()

  if (state.success) {
    return (
      <div className="kontakt-success">
        <div className="kontakt-success-icon">
          <FiCheck aria-hidden />
        </div>
        <h3 className="display display-4">Takk — meldingen er sendt.</h3>
        <p className="muted" style={{ marginTop: '.5rem', fontSize: '.9375rem' }}>
          Jeg svarer så snart jeg kan.
        </p>
      </div>
    )
  }

  return (
    <form
      action={action}
      className="kontakt-form-fields"
      onSubmit={() => play('success')}
    >
      <div className="form-field">
        <label htmlFor="name" className="form-label mono">
          01 / Navn
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="form-input"
          placeholder="Ola Nordmann"
        />
      </div>
      <div className="form-field">
        <label htmlFor="email" className="form-label mono">
          02 / E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="form-input"
          placeholder="ola@example.no"
        />
      </div>
      <div className="form-field">
        <label htmlFor="message" className="form-label mono">
          03 / Melding
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Skriv fritt. Jeg leser alt."
          className="form-input form-textarea"
        />
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden
        style={{ position: 'absolute', left: '-9999px' }}
        autoComplete="off"
      />
      <div className="kontakt-form-foot">
        <span className="dim mono" style={{ fontSize: '.6875rem', letterSpacing: '.08em' }}>
          Beskyttet av honeypot + rate-limit
        </span>
        <Magnetic>
          <button type="submit" className="btn-xl btn-xl-solid mono" disabled={pending}>
            {pending ? 'Sender …' : 'Send melding'} <FiArrowRight aria-hidden />
          </button>
        </Magnetic>
      </div>
      {state.error && (
        <p role="alert" style={{ color: 'var(--accent)', fontSize: '.875rem' }}>
          {state.error}
        </p>
      )}
    </form>
  )
}
