'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { FiCpu, FiSave, FiZap } from 'react-icons/fi'
import { Button } from '@/components/Button'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import { suggestSlug } from '@/lib/translate'
import type { ContentEntity, ContentTranslation } from '@/lib/types/app'
import {
  aiTranslate,
  saveTranslation,
  type TranslationFields,
  type TranslationState,
} from '@/app/admin/(dashboard)/translations-actions'

export type TranslationField = keyof TranslationFields

type Props = {
  entity: ContentEntity
  entityId: string
  translation: ContentTranslation | null
  fields: TranslationField[]
  labels?: Partial<Record<TranslationField, string>>
  contentRows?: number
}

const DEFAULT_LABELS: Record<TranslationField, string> = {
  slug: 'Slug (engelsk)',
  title: 'Tittel',
  description: 'Beskrivelse',
  content: 'Innhold (MDX)',
  role: 'Rolle',
}

const initial: TranslationState = {}

function fromTranslation(t: ContentTranslation | null): TranslationFields {
  return {
    slug: t?.slug ?? '',
    title: t?.title ?? '',
    description: t?.description ?? '',
    content: t?.content ?? '',
    role: t?.role ?? '',
  }
}

export function MachineTranslatedBadge() {
  return (
    <span className="chip inline-flex items-center gap-1" title="Oversatt av AI og ikke gjennomgått ennå">
      <FiCpu aria-hidden size={12} /> Maskinoversatt, ikke gjennomgått
    </span>
  )
}

export function TranslationPanel({ entity, entityId, translation, fields, labels, contentRows = 20 }: Props) {
  const [state, formAction] = useActionState(saveTranslation.bind(null, entity, entityId), initial)
  const [values, setValues] = useState<TranslationFields>(() => fromTranslation(translation))
  const [machine, setMachine] = useState(translation?.machine_translated ?? false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [translating, startTranslating] = useTransition()

  useEffect(() => {
    if (state.success) setMachine(false)
  }, [state])

  const set = (field: TranslationField, value: string) => setValues((v) => ({ ...v, [field]: value }))
  const label = (field: TranslationField) => labels?.[field] ?? DEFAULT_LABELS[field]
  const has = (field: TranslationField) => fields.includes(field)

  function handleAiTranslate() {
    setAiError(null)
    startTranslating(async () => {
      const result = await aiTranslate(entity, entityId)
      if ('error' in result) {
        setAiError(result.error)
        return
      }
      setValues(result.fields)
      setMachine(true)
    })
  }

  return (
    <form action={formAction}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button type="button" size="sm" onClick={handleAiTranslate} disabled={translating}>
          <FiZap aria-hidden /> {translating ? 'Oversetter …' : 'Oversett med AI'}
        </Button>
        {machine && <MachineTranslatedBadge />}
        {aiError && <p role="alert" className="text-xs text-accent">{aiError}</p>}
        <p className="text-xs text-ink-4 basis-full">
          Tomme felt faller tilbake til norsk på den engelske siden. Lagring markerer teksten som gjennomgått.
        </p>
      </div>

      {has('title') && (
        <FormField label={label('title')} htmlFor="en-title">
          <Input id="en-title" name="title" value={values.title} onChange={(e) => set('title', e.target.value)} disabled={translating} />
        </FormField>
      )}

      {has('slug') && (
        <FormField label={label('slug')} htmlFor="en-slug" hint="Kun små bokstaver, tall og bindestrek. Tom = samme som norsk slug.">
          <div className="flex gap-2">
            <Input
              id="en-slug"
              name="slug"
              mono
              value={values.slug}
              onChange={(e) => set('slug', e.target.value)}
              disabled={translating}
              pattern="[a-z0-9-]*"
            />
            <Button type="button" size="sm" onClick={() => set('slug', suggestSlug(values.title))} disabled={!values.title || translating}>
              Foreslå
            </Button>
          </div>
        </FormField>
      )}

      {has('description') && (
        <FormField label={label('description')} htmlFor="en-description">
          <Textarea
            id="en-description"
            name="description"
            rows={2}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            disabled={translating}
          />
        </FormField>
      )}

      {has('role') && (
        <FormField label={label('role')} htmlFor="en-role">
          <Input id="en-role" name="role" value={values.role} onChange={(e) => set('role', e.target.value)} disabled={translating} />
        </FormField>
      )}

      {has('content') && (
        <FormField label={label('content')} htmlFor="en-content">
          <Textarea
            id="en-content"
            name="content"
            mono
            rows={contentRows}
            value={values.content}
            onChange={(e) => set('content', e.target.value)}
            disabled={translating}
          />
        </FormField>
      )}

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-rule">
        <SubmitButton pendingLabel="Lagrer …" disabled={translating}>
          <FiSave aria-hidden /> Lagre engelsk
        </SubmitButton>
        <FormStatus success={state.success ? 'Lagret' : undefined} error={state.error} className="ml-auto" />
      </div>
    </form>
  )
}
