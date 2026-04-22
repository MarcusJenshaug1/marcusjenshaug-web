'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { FiSave, FiTrash2 } from 'react-icons/fi'
import type { NowEntry } from '@/lib/types/app'
import { updateNowEntry, deleteNowEntry, type NowFormState } from '../actions'

const initial: NowFormState = {}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

type Props = {
  entry: NowEntry
}

export function EditNowForm({ entry }: Props) {
  const [state, action, pending] = useActionState(updateNowEntry.bind(null, entry.id), initial)

  return (
    <form action={action}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="content" style={labelStyle}>Innhold</label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={entry.content}
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
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="published_at" style={labelStyle}>Publiseringstidspunkt</label>
        <input
          id="published_at"
          name="published_at"
          type="datetime-local"
          defaultValue={toDatetimeLocal(entry.published_at)}
          style={{
            padding: '.5625rem .75rem',
            border: '1px solid var(--rule-strong)',
            borderRadius: '6px',
            background: 'var(--bg-elev)',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--rule)' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <FiSave /> {pending ? 'Lagrer …' : 'Lagre'}
        </button>
        <Link href="/admin/na" className="btn btn-sm">Avbryt</Link>
        <DeleteButton id={entry.id} />
        <div style={{ marginLeft: 'auto' }}>
          {state.success && <span className="muted" style={{ fontSize: '.875rem' }}>✓ Lagret</span>}
          {state.error && <span style={{ color: 'var(--accent)', fontSize: '.875rem' }}>{state.error}</span>}
        </div>
      </div>
    </form>
  )
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteNowEntry.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm('Slette denne oppføringen? Kan ikke angres.')) e.preventDefault()
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>
        <FiTrash2 /> Slett
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.8125rem',
  color: 'var(--ink-3)',
  marginBottom: '.375rem',
  fontWeight: 500,
}
