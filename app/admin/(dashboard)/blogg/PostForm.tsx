'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiSave, FiExternalLink, FiTrash2 } from 'react-icons/fi'
import { slugify } from '@/lib/slug'
import { useAutosave } from '@/lib/hooks/useAutosave'
import { ImageUploader } from '@/components/ui/ImageUploader'
import type { Post } from '@/lib/types/app'
import {
  createPost,
  updatePost,
  autosavePost,
  deletePost,
  type PostFormState,
} from './actions'

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

const monoStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: 'var(--ff-mono)',
  fontSize: '.8125rem',
  lineHeight: 1.6,
}

const initial: PostFormState = {}

type Props = {
  post?: Post
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

export function PostForm({ post }: Props) {
  const isEdit = Boolean(post)
  const boundAction = isEdit ? updatePost.bind(null, post!.id) : createPost
  const [state, action, pending] = useActionState(boundAction, initial)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(post))
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const formRef = useRef<HTMLFormElement>(null)
  const autoSaveFn = useCallback(
    (fd: FormData) => (post ? autosavePost(post.id, fd) : Promise.resolve()),
    [post]
  )
  const { dirty, savedAt, markDirty } = useAutosave(formRef, autoSaveFn)

  return (
    <form ref={formRef} action={action} onChange={isEdit ? markDirty : undefined}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <Field label="Tittel" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Kun små bokstaver, tall og bindestrek">
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              style={{ ...inputStyle, fontFamily: 'var(--ff-mono)', fontSize: '.875rem' }}
            />
          </Field>

          <Field label="Ingress" htmlFor="description" hint="Kort sammendrag, vises i lister og OG-bilde">
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              defaultValue={post?.description ?? ''}
              style={inputStyle}
            />
          </Field>

          <Field label="Innhold (MDX)" htmlFor="content">
            <textarea
              id="content"
              name="content"
              required
              rows={24}
              defaultValue={post?.content ?? ''}
              style={monoStyle}
              placeholder={'# Overskrift\n\nTekst her …\n\n```ts\nconst x = 1\n```'}
            />
          </Field>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section>
            <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: '.875rem' }}>
              Publisering
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', marginBottom: '.75rem' }}>
              <input type="checkbox" name="draft" defaultChecked={post?.draft ?? true} />
              Utkast (skjult for public)
            </label>
            <Field label="Publiseringstidspunkt" htmlFor="published_at" hint="Sett fremtidig dato for planlagt publisering">
              <input
                id="published_at"
                name="published_at"
                type="datetime-local"
                defaultValue={toDatetimeLocal(post?.published_at ?? null)}
                style={inputStyle}
              />
            </Field>
          </section>

          <section>
            <Field label="Tags" htmlFor="tags" hint="Kommaseparert">
              <input
                id="tags"
                name="tags"
                defaultValue={post?.tags.join(', ') ?? ''}
                style={{ ...inputStyle, fontFamily: 'var(--ff-mono)', fontSize: '.8125rem' }}
              />
            </Field>

            <Field label="Cover-bilde" htmlFor="cover_image">
              <ImageUploader
                name="cover_image"
                value={coverImage}
                onChange={(v) => {
                  setCoverImage(v)
                  markDirty()
                }}
                folder="blog"
              />
            </Field>
          </section>
        </aside>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--rule)' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <FiSave /> {pending ? 'Lagrer …' : 'Lagre'}
        </button>
        {isEdit && post && (
          <>
            <Link href={`/blogg/${post.slug}${post.draft ? '?preview=1' : ''}`} target="_blank" className="btn btn-sm">
              <FiExternalLink /> Forhåndsvis
            </Link>
            <DeleteButton id={post.id} title={post.title} />
          </>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '.875rem' }}>
          {state.success && <span className="muted">✓ Lagret</span>}
          {state.error && <span style={{ color: 'var(--accent)' }}>{state.error}</span>}
          {!state.error && !state.success && isEdit && dirty && (
            <span className="dim mono" style={{ fontSize: '.75rem' }}>• ulagrede endringer</span>
          )}
          {!state.error && !state.success && isEdit && !dirty && savedAt && (
            <span className="dim mono" style={{ fontSize: '.75rem' }}>
              autolagret {savedAt.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
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

function DeleteButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePost.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Slette «${title}»? Dette kan ikke angres.`)) e.preventDefault()
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>
        <FiTrash2 /> Slett
      </button>
    </form>
  )
}
