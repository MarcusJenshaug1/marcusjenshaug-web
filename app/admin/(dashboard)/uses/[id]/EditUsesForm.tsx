'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { FiSave, FiTrash2 } from 'react-icons/fi'
import type { UsesItem } from '@/lib/types/app'
import { updateUsesItem, deleteUsesItem, type UsesFormState } from '../actions'

const initial: UsesFormState = {}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.8125rem',
  color: 'var(--ink-3)',
  marginBottom: '.375rem',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.5625rem .75rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '6px',
  background: 'var(--bg-elev)',
}

type Props = {
  item: UsesItem
  existingCategories: string[]
}

export function EditUsesForm({ item, existingCategories }: Props) {
  const [state, action, pending] = useActionState(updateUsesItem.bind(null, item.id), initial)

  return (
    <form action={action}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <Field label="Kategori" htmlFor="category">
          <input
            id="category"
            name="category"
            list="edit-categories"
            required
            defaultValue={item.category}
            style={inputStyle}
          />
          <datalist id="edit-categories">
            {existingCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <Field label="Navn" htmlFor="name">
          <input id="name" name="name" required defaultValue={item.name} style={inputStyle} />
        </Field>
      </div>

      <Field label="Beskrivelse" htmlFor="description" hint="Én kort setning">
        <input id="description" name="description" defaultValue={item.description ?? ''} style={inputStyle} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <Field label="URL" htmlFor="url">
          <input id="url" name="url" type="url" defaultValue={item.url ?? ''} style={inputStyle} />
        </Field>
        <Field label="Sortering" htmlFor="order_index">
          <input id="order_index" name="order_index" type="number" defaultValue={item.order_index} style={inputStyle} />
        </Field>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--rule)' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <FiSave /> {pending ? 'Lagrer …' : 'Lagre'}
        </button>
        <Link href="/admin/uses" className="btn btn-sm">Avbryt</Link>
        <DeleteButton id={item.id} name={item.name} />
        <div style={{ marginLeft: 'auto' }}>
          {state.success && <span className="muted" style={{ fontSize: '.875rem' }}>✓ Lagret</span>}
          {state.error && <span style={{ color: 'var(--accent)', fontSize: '.875rem' }}>{state.error}</span>}
        </div>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ marginTop: '.25rem', fontSize: '.75rem', color: 'var(--ink-4)' }}>{hint}</p>}
    </div>
  )
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteUsesItem.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Slette «${name}»?`)) e.preventDefault()
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>
        <FiTrash2 /> Slett
      </button>
    </form>
  )
}
