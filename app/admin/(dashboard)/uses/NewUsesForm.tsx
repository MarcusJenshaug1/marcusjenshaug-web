'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { createUsesItem, type UsesFormState } from './actions'

const initial: UsesFormState = {}

const inputStyle: React.CSSProperties = {
  padding: '.5625rem .75rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '6px',
  background: 'var(--bg-elev)',
}

type Props = {
  existingCategories: string[]
}

export function NewUsesForm({ existingCategories }: Props) {
  const [state, action, pending] = useActionState(createUsesItem, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const [category, setCategory] = useState(existingCategories[0] ?? '')

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={action} style={{ display: 'grid', gap: '.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
        <div>
          <input
            list="categories"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategori (f.eks. Hardware)"
            style={{ ...inputStyle, width: '100%' }}
          />
          <datalist id="categories">
            {existingCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <input
          name="name"
          required
          placeholder="Navn (f.eks. MacBook Pro 14)"
          style={{ ...inputStyle, width: '100%' }}
        />
      </div>
      <input
        name="description"
        placeholder="Kort beskrivelse (én setning)"
        style={{ ...inputStyle, width: '100%' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.75rem' }}>
        <input
          name="url"
          type="url"
          placeholder="URL (valgfritt)"
          style={{ ...inputStyle, width: '100%' }}
        />
        <input
          name="order_index"
          type="number"
          defaultValue={0}
          placeholder="Sortering"
          style={{ ...inputStyle, width: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <FiPlus /> {pending ? 'Legger til …' : 'Legg til'}
        </button>
        {state.success && <span className="muted" style={{ fontSize: '.875rem' }}>✓ Lagt til</span>}
        {state.error && <span style={{ color: 'var(--accent)', fontSize: '.875rem' }}>{state.error}</span>}
      </div>
    </form>
  )
}
