'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { FiSave, FiTrash2 } from 'react-icons/fi'
import type { NowEntry } from '@/lib/types/app'
import { datetimeLocalToIso, toDatetimeLocal } from '@/lib/datetime'
import { updateNowEntry, deleteNowEntry, type NowFormState } from '../actions'

const initial: NowFormState = {}

type Props = {
  entry: NowEntry
}

export function EditNowForm({ entry }: Props) {
  const [state, action, pending] = useActionState(updateNowEntry.bind(null, entry.id), initial)
  const [publishedAt, setPublishedAt] = useState('')

  useEffect(() => {
    setPublishedAt(toDatetimeLocal(entry.published_at))
  }, [entry.published_at])

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
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          style={{
            padding: '.5625rem .75rem',
            border: '1px solid var(--rule-strong)',
            borderRadius: '6px',
            background: 'var(--bg-elev)',
          }}
        />
        <input type="hidden" name="published_at_iso" value={datetimeLocalToIso(publishedAt)} />
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
