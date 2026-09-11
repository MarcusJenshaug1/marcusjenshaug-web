'use client'

import { useActionState, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { FiExternalLink, FiSave } from 'react-icons/fi'
import { slugify } from '@/lib/slug'
import { useAutosave } from '@/lib/hooks/useAutosave'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import { DeleteButton } from './DeleteInlineForm'

export type EditorState = {
  error?: string
  success?: boolean
}

export type EditorRecord = {
  id: string
  title: string
  slug: string
  description: string
  content: string
  cover_image: string | null
  draft: boolean
}

type Props = {
  record?: EditorRecord
  action: (state: EditorState, formData: FormData) => Promise<EditorState>
  autosave: (id: string, formData: FormData) => Promise<{ error?: string } | void>
  onDelete: (id: string) => Promise<void>
  previewBase: string
  coverFolder: string
  descriptionLabel: string
  descriptionHint?: string
  contentRows?: number
  contentPlaceholder?: string
  publishing?: ReactNode
  children?: ReactNode
}

const initial: EditorState = {}

export function EditorShell({
  record,
  action,
  autosave,
  onDelete,
  previewBase,
  coverFolder,
  descriptionLabel,
  descriptionHint,
  contentRows = 20,
  contentPlaceholder,
  publishing,
  children,
}: Props) {
  const isEdit = Boolean(record)
  const [state, formAction] = useActionState(action, initial)

  const [title, setTitle] = useState(record?.title ?? '')
  const [slug, setSlug] = useState(record?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [coverImage, setCoverImage] = useState(record?.cover_image ?? '')
  const [draft, setDraft] = useState(record?.draft ?? true)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const formRef = useRef<HTMLFormElement>(null)
  const save = useCallback(
    (fd: FormData) => (record ? autosave(record.id, fd) : Promise.resolve()),
    [record, autosave]
  )
  const { dirty, savedAt, markDirty } = useAutosave(formRef, save, { enabled: isEdit && draft })

  return (
    <form ref={formRef} action={formAction} onChange={isEdit ? markDirty : undefined}>
      <div className="grid grid-cols-[2fr_1fr] gap-8">
        <div>
          <FormField label="Tittel" htmlFor="title">
            <Input id="title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>

          <FormField label="Slug" htmlFor="slug" hint="Kun små bokstaver, tall og bindestrek">
            <Input
              id="slug"
              name="slug"
              mono
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
            />
          </FormField>

          <FormField label={descriptionLabel} htmlFor="description" hint={descriptionHint}>
            <Textarea id="description" name="description" required rows={2} defaultValue={record?.description ?? ''} />
          </FormField>

          <FormField label="Innhold (MDX)" htmlFor="content">
            <Textarea
              id="content"
              name="content"
              mono
              required
              rows={contentRows}
              defaultValue={record?.content ?? ''}
              placeholder={contentPlaceholder}
            />
          </FormField>
        </div>

        <aside className="flex flex-col gap-6">
          <section>
            <h3 className="text-xs uppercase tracking-[0.12em] text-ink-3 font-medium mb-3.5">Publisering</h3>
            <Checkbox
              name="draft"
              label="Utkast (skjult for public)"
              checked={draft}
              onChange={(e) => setDraft(e.target.checked)}
              className="mb-3"
            />
            {publishing}
          </section>

          {children}

          <section>
            <FormField label="Cover-bilde" htmlFor="cover_image">
              <ImageUploader
                id="cover_image"
                name="cover_image"
                value={coverImage}
                onChange={(v) => {
                  setCoverImage(v)
                  markDirty()
                }}
                folder={coverFolder}
              />
            </FormField>
          </section>
        </aside>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-rule">
        <SubmitButton pendingLabel="Lagrer …">
          <FiSave aria-hidden /> Lagre
        </SubmitButton>
        {record && (
          <>
            <Link
              href={`${previewBase}/${record.slug}${record.draft ? '?preview=1' : ''}`}
              target="_blank"
              className="btn btn-sm"
            >
              <FiExternalLink aria-hidden /> Forhåndsvis
            </Link>
            <DeleteButton
              action={onDelete.bind(null, record.id)}
              confirmText={`Slette «${record.title}»? Dette kan ikke angres.`}
              label="Slett"
            />
          </>
        )}
        <FormStatus success={state.success ? 'Lagret' : undefined} error={state.error} className="ml-auto">
          {isEdit && dirty && <span className="dim mono text-xs">ulagrede endringer</span>}
          {isEdit && !dirty && savedAt && (
            <span className="dim mono text-xs">
              autolagret {savedAt.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </FormStatus>
      </div>
    </form>
  )
}
