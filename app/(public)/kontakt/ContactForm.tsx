'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { Magnetic } from '@/components/motion/Magnetic'
import { useSound } from '@/components/motion/SoundProvider'
import { sendContactMessage, type ContactState } from './actions'
import { parseContact, type ContactFieldErrors } from './schema'

const initial: ContactState = {}

type FieldName = keyof ContactFieldErrors

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="form-error">
      {message}
    </p>
  )
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial)
  const [clientErrors, setClientErrors] = useState<ContactFieldErrors | null>(null)
  const { play } = useSound()
  const playRef = useRef(play)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    playRef.current = play
  }, [play])

  useEffect(() => {
    if (!state.success) return
    playRef.current('success')
    successRef.current?.focus()
  }, [state.success])

  if (state.success) {
    return (
      <div ref={successRef} className="kontakt-success" role="status" tabIndex={-1}>
        <div className="kontakt-success-icon">
          <FiCheck aria-hidden />
        </div>
        <h2 className="display display-4">Takk — meldingen er sendt.</h2>
        <p className="muted" style={{ marginTop: '.5rem', fontSize: '.9375rem' }}>
          Jeg svarer så snart jeg kan.
        </p>
      </div>
    )
  }

  const errors = clientErrors ?? state.fieldErrors ?? {}

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const { fieldErrors } = parseContact(new FormData(e.currentTarget))
    setClientErrors(fieldErrors)
    if (!fieldErrors) return
    e.preventDefault()
    const first = (Object.keys(fieldErrors) as FieldName[]).find((k) => fieldErrors[k])
    if (first) document.getElementById(first)?.focus()
  }

  const fieldProps = (name: FieldName) => ({
    id: name,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form action={action} className="kontakt-form-fields" noValidate onSubmit={onSubmit}>
      <div className="form-field">
        <label htmlFor="name" className="form-label mono">
          01 / Navn
        </label>
        <input
          {...fieldProps('name')}
          required
          autoComplete="name"
          className="form-input"
          placeholder="Ola Nordmann"
        />
        <FieldError id="name-error" message={errors.name} />
      </div>
      <div className="form-field">
        <label htmlFor="email" className="form-label mono">
          02 / E-post
        </label>
        <input
          {...fieldProps('email')}
          type="email"
          required
          autoComplete="email"
          className="form-input"
          placeholder="ola@example.no"
        />
        <FieldError id="email-error" message={errors.email} />
      </div>
      <div className="form-field">
        <label htmlFor="message" className="form-label mono">
          03 / Melding
        </label>
        <textarea
          {...fieldProps('message')}
          rows={6}
          required
          placeholder="Skriv fritt. Jeg leser alt."
          className="form-input form-textarea"
        />
        <FieldError id="message-error" message={errors.message} />
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
        <span className="dim mono" style={{ fontSize: '.75rem', letterSpacing: '.08em' }}>
          Jeg svarer vanligvis innen ett døgn
        </span>
        <Magnetic>
          <button type="submit" className="btn-xl btn-xl-solid mono" disabled={pending}>
            {pending ? 'Sender …' : 'Send melding'} <FiArrowRight aria-hidden />
          </button>
        </Magnetic>
      </div>
      {state.error && (
        <p role="alert" className="form-error" style={{ fontSize: '.875rem' }}>
          {state.error}
        </p>
      )}
    </form>
  )
}
