'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { Magnetic } from '@/components/motion/Magnetic'
import { useSound } from '@/components/motion/SoundProvider'
import type { Locale } from '@/lib/i18n/config'
import { sendContactMessage, type ContactState } from './actions'
import { parseContact, type ContactErrorKey, type ContactField, type ContactFieldErrors } from './schema'

const initial: ContactState = {}

// Alle tekster kommer ferdig oversatt fra serveren, så klienten slipper ordboken.
export type ContactLabels = {
  name: string
  email: string
  message: string
  namePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  send: string
  sending: string
  note: string
  successTitle: string
  successBody: string
  errors: Record<ContactErrorKey, string>
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="form-error">
      {message}
    </p>
  )
}

export function ContactForm({ locale, labels }: { locale: Locale; labels: ContactLabels }) {
  const boundAction = useMemo(() => sendContactMessage.bind(null, locale), [locale])
  const [state, action, pending] = useActionState(boundAction, initial)
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
        <h2 className="display display-4">{labels.successTitle}</h2>
        <p className="muted" style={{ marginTop: '.5rem', fontSize: '.9375rem' }}>
          {labels.successBody}
        </p>
      </div>
    )
  }

  const errorKeys = clientErrors ?? state.fieldErrors ?? {}
  const errorText = (field: ContactField) => {
    const key = errorKeys[field]
    return key ? labels.errors[key] : undefined
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const { fieldErrors } = parseContact(new FormData(e.currentTarget))
    setClientErrors(fieldErrors)
    if (!fieldErrors) return
    e.preventDefault()
    const first = (Object.keys(fieldErrors) as ContactField[]).find((k) => fieldErrors[k])
    if (first) document.getElementById(first)?.focus()
  }

  const fieldProps = (name: ContactField) => ({
    id: name,
    name,
    'aria-invalid': errorKeys[name] ? true : undefined,
    'aria-describedby': errorKeys[name] ? `${name}-error` : undefined,
  })

  return (
    <form action={action} className="kontakt-form-fields" noValidate onSubmit={onSubmit}>
      <div className="form-field">
        <label htmlFor="name" className="form-label mono">
          01 / {labels.name}
        </label>
        <input
          {...fieldProps('name')}
          required
          autoComplete="name"
          className="form-input"
          placeholder={labels.namePlaceholder}
        />
        <FieldError id="name-error" message={errorText('name')} />
      </div>
      <div className="form-field">
        <label htmlFor="email" className="form-label mono">
          02 / {labels.email}
        </label>
        <input
          {...fieldProps('email')}
          type="email"
          required
          autoComplete="email"
          className="form-input"
          placeholder={labels.emailPlaceholder}
        />
        <FieldError id="email-error" message={errorText('email')} />
      </div>
      <div className="form-field">
        <label htmlFor="message" className="form-label mono">
          03 / {labels.message}
        </label>
        <textarea
          {...fieldProps('message')}
          rows={6}
          required
          placeholder={labels.messagePlaceholder}
          className="form-input form-textarea"
        />
        <FieldError id="message-error" message={errorText('message')} />
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
          {labels.note}
        </span>
        <Magnetic>
          <button type="submit" className="btn-xl btn-xl-solid mono" disabled={pending}>
            {pending ? labels.sending : labels.send} <FiArrowRight aria-hidden />
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
