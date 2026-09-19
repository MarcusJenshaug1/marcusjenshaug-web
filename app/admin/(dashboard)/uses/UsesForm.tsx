'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiSave } from 'react-icons/fi'
import type { ContentTranslation, UsesItem } from '@/lib/types/app'
import { DeleteButton } from '@/components/admin/DeleteInlineForm'
import { LocaleTabs, type EditorLocale } from '@/components/admin/LocaleTabs'
import { TranslationPanel } from '@/components/admin/TranslationPanel'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { createUsesItem, updateUsesItem, deleteUsesItem, type UsesFormState } from './actions'

const initial: UsesFormState = {}

type Props = {
  item?: UsesItem
  existingCategories: string[]
  translation?: ContentTranslation | null
}

export function UsesForm({ item, existingCategories, translation = null }: Props) {
  const [state, action] = useActionState(item ? updateUsesItem.bind(null, item.id) : createUsesItem, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const [category, setCategory] = useState(item?.category ?? existingCategories[0] ?? '')
  const [locale, setLocale] = useState<EditorLocale>('nb')

  useEffect(() => {
    if (!item && state.success) formRef.current?.reset()
  }, [item, state.success])

  const form = (
    <form
      ref={formRef}
      action={action}
      role={item ? 'tabpanel' : undefined}
      id={item ? 'panel-nb' : undefined}
      aria-labelledby={item ? 'tab-nb' : undefined}
      hidden={item ? locale !== 'nb' : undefined}
    >
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        <FormField label="Kategori" htmlFor="category">
          <Input
            id="category"
            name="category"
            list="uses-categories"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="F.eks. Hardware"
          />
          <datalist id="uses-categories">
            {existingCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </FormField>
        <FormField label="Navn" htmlFor="name">
          <Input id="name" name="name" required defaultValue={item?.name ?? ''} placeholder="F.eks. MacBook Pro 14" />
        </FormField>
      </div>

      <FormField label="Beskrivelse" htmlFor="description" hint="Én kort setning">
        <Input id="description" name="description" defaultValue={item?.description ?? ''} />
      </FormField>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <FormField label="URL" htmlFor="url" hint="Valgfritt">
          <Input id="url" name="url" type="url" defaultValue={item?.url ?? ''} placeholder="https://…" />
        </FormField>
        <FormField label="Sortering" htmlFor="order_index">
          <Input id="order_index" name="order_index" type="number" defaultValue={item?.order_index ?? 0} />
        </FormField>
      </div>

      {item ? (
        <div className="flex items-center gap-4 mt-2 pt-4 border-t border-rule">
          <SubmitButton pendingLabel="Lagrer …">
            <FiSave aria-hidden /> Lagre
          </SubmitButton>
          <Link href="/admin/uses" className="btn btn-sm">Avbryt</Link>
          <DeleteButton action={deleteUsesItem.bind(null, item.id)} confirmText={`Slette «${item.name}»?`} label="Slett" />
          <FormStatus success={state.success ? 'Lagret' : undefined} error={state.error} className="ml-auto" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <SubmitButton pendingLabel="Legger til …">
            <FiPlus aria-hidden /> Legg til
          </SubmitButton>
          <FormStatus success={state.success ? 'Lagt til' : undefined} error={state.error} />
        </div>
      )}
    </form>
  )

  if (!item) return form

  return (
    <div>
      <LocaleTabs
        value={locale}
        onChange={setLocale}
        enBadge={!translation ? 'mangler' : translation.machine_translated ? 'maskin' : undefined}
      />
      <div role="tabpanel" id="panel-en" aria-labelledby="tab-en" hidden={locale !== 'en'}>
        <TranslationPanel
          entity="uses_items"
          entityId={item.id}
          translation={translation}
          fields={['title', 'description']}
          labels={{ title: 'Navn', description: 'Beskrivelse' }}
        />
      </div>
      {form}
    </div>
  )
}
