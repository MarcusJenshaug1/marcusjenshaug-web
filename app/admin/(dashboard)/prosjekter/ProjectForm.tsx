'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiSave, FiExternalLink, FiTrash2 } from 'react-icons/fi'
import { slugify } from '@/lib/slug'
import { useAutosave } from '@/lib/hooks/useAutosave'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type Project } from '@/lib/types/app'
import {
  createProject,
  updateProject,
  autosaveProject,
  deleteProject,
  type ProjectFormState,
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

const initial: ProjectFormState = {}

type Props = {
  project?: Project
}

export function ProjectForm({ project }: Props) {
  const isEdit = Boolean(project)
  const boundAction = isEdit
    ? updateProject.bind(null, project!.id)
    : createProject
  const [state, action, pending] = useActionState(boundAction, initial)

  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(project))
  const [coverImage, setCoverImage] = useState(project?.cover_image ?? '')

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const formRef = useRef<HTMLFormElement>(null)
  const autoSaveFn = useCallback(
    (fd: FormData) => (project ? autosaveProject(project.id, fd) : Promise.resolve()),
    [project]
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

          <Field label="Kort beskrivelse" htmlFor="description" hint="Vises i kort og lister">
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              defaultValue={project?.description ?? ''}
              style={inputStyle}
            />
          </Field>

          <Field label="Innhold (MDX)" htmlFor="content">
            <textarea
              id="content"
              name="content"
              required
              rows={20}
              defaultValue={project?.content ?? ''}
              style={monoStyle}
              placeholder="# Overskrift&#10;&#10;Tekst her …"
            />
          </Field>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section>
            <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: '.875rem' }}>
              Publisering
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', marginBottom: '.5rem' }}>
              <input type="checkbox" name="draft" defaultChecked={project?.draft ?? true} />
              Utkast (skjult for public)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem' }}>
              <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} />
              Vis på forsiden
            </label>
          </section>

          <section>
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={project?.status ?? 'aktiv'} style={inputStyle}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="Rolle" htmlFor="role" hint="F.eks. «Fullstack-utvikler»">
              <input id="role" name="role" defaultValue={project?.role ?? ''} style={inputStyle} />
            </Field>
            <Field label="Sortering" htmlFor="order_index" hint="Lavere = tidligere i lister">
              <input id="order_index" name="order_index" type="number" defaultValue={project?.order_index ?? 0} style={inputStyle} />
            </Field>
          </section>

          <section>
            <Field label="Tech-stack" htmlFor="tech_stack" hint="Kommaseparert: Next.js, Supabase, …">
              <input
                id="tech_stack"
                name="tech_stack"
                defaultValue={project?.tech_stack.join(', ') ?? ''}
                style={{ ...inputStyle, fontFamily: 'var(--ff-mono)', fontSize: '.8125rem' }}
              />
            </Field>
            <Field label="Live-URL" htmlFor="live_url">
              <input id="live_url" name="live_url" type="url" defaultValue={project?.live_url ?? ''} style={inputStyle} placeholder="https://…" />
            </Field>
            <Field label="Repo-URL" htmlFor="repo_url">
              <input id="repo_url" name="repo_url" type="url" defaultValue={project?.repo_url ?? ''} style={inputStyle} placeholder="https://github.com/…" />
            </Field>
            <Field label="Cover-bilde" htmlFor="cover_image">
              <ImageUploader
                name="cover_image"
                value={coverImage}
                onChange={(v) => {
                  setCoverImage(v)
                  markDirty()
                }}
                folder="prosjekter"
              />
            </Field>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <Field label="Startet" htmlFor="started_at">
              <input id="started_at" name="started_at" type="date" defaultValue={project?.started_at ?? ''} style={inputStyle} />
            </Field>
            <Field label="Avsluttet" htmlFor="ended_at">
              <input id="ended_at" name="ended_at" type="date" defaultValue={project?.ended_at ?? ''} style={inputStyle} />
            </Field>
          </section>
        </aside>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--rule)' }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <FiSave /> {pending ? 'Lagrer …' : 'Lagre'}
        </button>
        {isEdit && project && (
          <>
            <Link href={`/prosjekter/${project.slug}${project.draft ? '?preview=1' : ''}`} target="_blank" className="btn btn-sm">
              <FiExternalLink /> Forhåndsvis
            </Link>
            <DeleteButton id={project.id} title={project.title} />
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

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
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
      action={deleteProject.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Slette «${title}»? Dette kan ikke angres.`)) {
          e.preventDefault()
        }
      }}
      style={{ display: 'inline' }}
    >
      <button type="submit" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>
        <FiTrash2 /> Slett
      </button>
    </form>
  )
}
