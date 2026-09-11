'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { FiSave } from 'react-icons/fi'
import type { NowEntry } from '@/lib/types/app'
import { datetimeLocalToIso, toDatetimeLocal } from '@/lib/datetime'
import { DeleteButton } from '@/components/admin/DeleteInlineForm'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import { updateNowEntry, deleteNowEntry, type NowFormState } from '../actions'

const initial: NowFormState = {}

type Props = {
  entry: NowEntry
}

export function EditNowForm({ entry }: Props) {
  const [state, action] = useActionState(updateNowEntry.bind(null, entry.id), initial)
  const [publishedAt, setPublishedAt] = useState('')

  useEffect(() => {
    setPublishedAt(toDatetimeLocal(entry.published_at))
  }, [entry.published_at])

  return (
    <form action={action}>
      <FormField label="Innhold" htmlFor="content">
        <Textarea id="content" name="content" mono required rows={10} defaultValue={entry.content} />
      </FormField>

      <FormField label="Publiseringstidspunkt" htmlFor="published_at">
        <Input
          id="published_at"
          name="published_at"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className="w-auto"
        />
        <input type="hidden" name="published_at_iso" value={datetimeLocalToIso(publishedAt)} />
      </FormField>

      <div className="flex items-center gap-4 pt-4 border-t border-rule">
        <SubmitButton pendingLabel="Lagrer …">
          <FiSave aria-hidden /> Lagre
        </SubmitButton>
        <Link href="/admin/na" className="btn btn-sm">Avbryt</Link>
        <DeleteButton action={deleteNowEntry.bind(null, entry.id)} label="Slett" />
        <FormStatus success={state.success ? 'Lagret' : undefined} error={state.error} className="ml-auto" />
      </div>
    </form>
  )
}
