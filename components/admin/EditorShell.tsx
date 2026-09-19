'use client'

import { useActionState, useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { FiExternalLink, FiImage, FiSave } from 'react-icons/fi'
import { slugify } from '@/lib/slug'
import { useAutosave } from '@/lib/hooks/useAutosave'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import type { ContentEntity, ContentTranslation } from '@/lib/types/app'
import { DeleteButton } from './DeleteInlineForm'
import { LocaleTabs, type EditorLocale } from './LocaleTabs'
import { TranslationPanel, type TranslationField } from './TranslationPanel'

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
  entity: ContentEntity
  record?: EditorRecord
  translation?: ContentTranslation | null
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
  generateCover?: (hint: string) => Promise<{ url: string; subject: string } | { error: string }>
}

const initial: EditorState = {}

export function EditorShell({
  entity,
  record,
  translation = null,
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
  generateCover,
}: Props) {
  const isEdit = Boolean(record)
  const [locale, setLocale] = useState<EditorLocale>('nb')
  const [state, formAction] = useActionState(action, initial)
  const [coverHint, setCoverHint] = useState('')
  const [coverStatus, setCoverStatus] = useState<{ error?: string; subject?: string }>({})
  const [generating, startGenerating] = useTransition()

  function handleGenerateCover() {
    if (!generateCover) return
    setCoverStatus({})
    startGenerating(async () => {
      const result = await generateCover(coverHint)
      if ('error' in result) {
        setCoverStatus({ error: result.error })
        return
      }
      setCoverImage(result.url)
      setCoverStatus({ subject: result.subject })
    })
  }

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

  const translationFields: TranslationField[] =
    entity === 'projects' ? ['title', 'slug', 'description', 'role', 'content'] : ['title', 'slug', 'description', 'content']

  return (
    <div>
      {record && (
        <LocaleTabs
          value={locale}
          onChange={setLocale}
          enBadge={!translation ? 'mangler' : translation.machine_translated ? 'maskin' : undefined}
        />
      )}

      {record && (
        <div role="tabpanel" id="panel-en" aria-labelledby="tab-en" hidden={locale !== 'en'}>
          <TranslationPanel
            entity={entity}
            entityId={record.id}
            translation={translation}
            fields={translationFields}
            labels={{ description: descriptionLabel }}
            contentRows={contentRows}
          />
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        onChange={isEdit ? markDirty : undefined}
        role={record ? 'tabpanel' : undefined}
        id={record ? 'panel-nb' : undefined}
        aria-labelledby={record ? 'tab-nb' : undefined}
        hidden={locale !== 'nb'}
      >
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
              {generateCover && (
                <div className="mt-3 flex flex-col gap-2">
                  <FormField label="Motiv (valgfritt)" htmlFor="cover_hint" hint="Styrer AI-motivet, ellers utledes det fra tittel, beskrivelse og innhold">
                    <Textarea
                      id="cover_hint"
                      rows={2}
                      value={coverHint}
                      onChange={(e) => setCoverHint(e.target.value)}
                      placeholder="F.eks. «en kortstokk og to shotglass»"
                      disabled={generating}
                    />
                  </FormField>
                  <Button type="button" size="sm" onClick={handleGenerateCover} disabled={generating}>
                    <FiImage aria-hidden /> {generating ? 'Genererer … (opptil ett minutt)' : 'Generer cover med AI'}
                  </Button>
                  {coverStatus.error && (
                    <p role="alert" className="text-xs text-accent">{coverStatus.error}</p>
                  )}
                  {coverStatus.subject && (
                    <p role="status" className="text-xs text-ink-3">
                      Lagret. Motiv: {coverStatus.subject}
                    </p>
                  )}
                </div>
              )}
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
    </div>
  )
}
