'use client'

import { FiTrash2 } from 'react-icons/fi'
import { deleteUsesItem } from './actions'

export function DeleteInlineForm({ id }: { id: string }) {
  return (
    <form
      action={deleteUsesItem.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm('Slette denne oppføringen?')) e.preventDefault()
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>
        <FiTrash2 />
      </button>
    </form>
  )
}
