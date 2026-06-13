'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { FiMenu, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/lib/types/app'
import { reorderProjects, togglePublish } from './actions'

export type AdminProjectRow = {
  id: string
  slug: string
  title: string
  status: ProjectStatus
  featured: boolean
  draft: boolean
  updatedLabel: string
}

function move(list: AdminProjectRow[], from: number, to: number): AdminProjectRow[] {
  if (from === to) return list
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function SortableProjectList({ projects }: { projects: AdminProjectRow[] }) {
  const [rows, setRows] = useState(projects)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const [isPending, startTransition] = useTransition()
  const dragIndex = useRef<number | null>(null)

  useEffect(() => {
    if (!isPending) setRows(projects)
  }, [projects, isPending])

  function commit(next: AdminProjectRow[], message: string) {
    const prev = rows
    setRows(next)
    setError(null)
    setAnnounce(message)
    startTransition(async () => {
      try {
        const res = await reorderProjects(next.map((p) => p.id))
        if (res?.error) {
          setRows(prev)
          setError(res.error)
        }
      } catch {
        setRows(prev)
        setError('Kunne ikke lagre rekkefølge.')
      }
    })
  }

  function handleDrop(index: number) {
    const from = dragIndex.current
    dragIndex.current = null
    setOverIndex(null)
    if (from === null || from === index) return
    const title = rows[from].title
    commit(move(rows, from, index), `${title} flyttet til plass ${index + 1} av ${rows.length}.`)
  }

  function handleKey(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      commit(move(rows, index, index - 1), `${rows[index].title} flyttet til plass ${index} av ${rows.length}.`)
    } else if (e.key === 'ArrowDown' && index < rows.length - 1) {
      e.preventDefault()
      commit(move(rows, index, index + 1), `${rows[index].title} flyttet til plass ${index + 2} av ${rows.length}.`)
    }
  }

  return (
    <div>
      <ul className="card sortable" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.map((p, index) => {
          const from = dragIndex.current
          const isOver = from !== null && from !== index && overIndex === index
          const below = isOver && from !== null && from < index
          return (
            <Row
              key={p.id}
              project={p}
              isOver={isOver}
              below={below}
              onDragStart={() => {
                dragIndex.current = index
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (overIndex !== index) setOverIndex(index)
              }}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                dragIndex.current = null
                setOverIndex(null)
              }}
              onKey={(e) => handleKey(e, index)}
            />
          )
        })}
      </ul>
      <p aria-live="polite" className="sr-only">{announce}</p>
      {error && (
        <p style={{ marginTop: '.75rem', fontSize: '.8125rem', color: 'var(--accent)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

type RowProps = {
  project: AdminProjectRow
  isOver: boolean
  below: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
  onKey: (e: React.KeyboardEvent) => void
}

function Row({ project: p, isOver, below, onDragStart, onDragOver, onDrop, onDragEnd, onKey }: RowProps) {
  const ref = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={ref}
      className={`sortable-row${isOver ? ' drag-over' : ''}${below ? ' drag-below' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        className="sortable-handle"
        aria-label={`Flytt ${p.title}. Bruk pil opp og pil ned for å endre rekkefølge.`}
        draggable
        onDragStart={(e) => {
          if (ref.current) e.dataTransfer.setDragImage(ref.current, 16, 16)
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', p.id)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        onKeyDown={onKey}
      >
        <FiMenu aria-hidden />
      </button>

      <div className="sortable-main">
        <Link href={`/admin/prosjekter/${p.id}`} style={{ fontWeight: 500 }}>
          {p.title}
        </Link>
        <div className="dim mono" style={{ fontSize: '.75rem', marginTop: '.125rem' }}>/{p.slug}</div>
      </div>

      <span className="chip" style={{ flexShrink: 0 }}>{PROJECT_STATUS_LABELS[p.status]}</span>
      {p.featured && (
        <span className="chip chip-accent" style={{ flexShrink: 0 }} title="Vises på forsiden">
          <span aria-hidden>★</span>
          <span className="sr-only">Vises på forsiden</span>
        </span>
      )}

      <span className="mono dim sortable-date" style={{ fontSize: '.75rem' }}>{p.updatedLabel}</span>

      <form action={togglePublish.bind(null, p.id, p.draft)} style={{ flexShrink: 0 }}>
        <button type="submit" className="btn btn-sm btn-ghost" title={p.draft ? 'Publiser' : 'Avpubliser'}>
          {p.draft ? <><FiEyeOff /> Utkast</> : <><FiEye /> Publisert</>}
        </button>
      </form>

      <Link href={`/admin/prosjekter/${p.id}`} className="btn btn-sm" style={{ flexShrink: 0 }}>
        <FiEdit3 /> Rediger
      </Link>
    </li>
  )
}
