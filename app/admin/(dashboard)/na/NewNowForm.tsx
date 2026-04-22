'use client'

import { useActionState, useRef, useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { createNowEntry, type NowFormState } from './actions'

const initial: NowFormState = {}

export function NewNowForm() {
  const [state, action, pending] = useActionState(createNowEntry, initial)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={action}>
      <textarea
        name="content"
        required
        rows={4}
        placeholder="Hva jobber du med akkurat nå? Markdown/MDX støttet."
        style={{
          width: '100%',
          padding: '.75rem .875rem',
          border: '1px solid var(--rule-strong)',
          borderRadius: '6px',
          background: 'var(--bg-elev)',
          fontFamily: 'var(--ff-mono)',
          fontSize: '.875rem',
          lineHeight: 1.6,
          resize: 'vertical',
          marginBottom: '.75rem',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Publiserer …' : (<>Publiser <FiArrowRight /></>)}
        </button>
        {state.success && <span className="muted" style={{ fontSize: '.875rem' }}>✓ Publisert</span>}
        {state.error && <span style={{ color: 'var(--accent)', fontSize: '.875rem' }}>{state.error}</span>}
      </div>
    </form>
  )
}
