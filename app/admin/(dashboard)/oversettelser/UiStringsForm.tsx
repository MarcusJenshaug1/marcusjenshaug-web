'use client'

import { useActionState, useMemo, useState } from 'react'
import { FiSave, FiSearch } from 'react-icons/fi'
import { FormStatus } from '@/components/ui/FormStatus'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { saveUiStrings, type UiStringsState } from './actions'

export type UiStringRow = {
  key: string
  nbDefault: string
  enDefault: string
  nb: string
  en: string
}

const initial: UiStringsState = {}

export function UiStringsForm({ rows }: { rows: UiStringRow[] }) {
  const [state, action] = useActionState(saveUiStrings, initial)
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return new Set(rows.map((r) => r.key))
    return new Set(
      rows
        .filter((r) => [r.key, r.nbDefault, r.enDefault, r.nb, r.en].some((v) => v.toLowerCase().includes(q)))
        .map((r) => r.key)
    )
  }, [rows, query])

  const overridden = rows.filter((r) => r.nb || r.en).length

  return (
    <form action={action}>
      <div className="flex items-center gap-4 mb-4">
        <label className="relative flex-1 max-w-md">
          <FiSearch aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" size={14} />
          <span className="sr-only">Søk i nøkler og tekster</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer nøkler og tekster …"
            className="pl-8"
          />
        </label>
        <span className="mono dim text-xs">
          {visible.size} av {rows.length} · {overridden} overstyrt
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sunken)' }}>
              <Th style={{ width: '22%' }}>Nøkkel</Th>
              <Th>Norsk</Th>
              <Th>English</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} hidden={!visible.has(r.key)} style={{ borderTop: '1px solid var(--rule)' }}>
                <td style={{ padding: '.5rem .875rem', verticalAlign: 'top' }}>
                  <code className="mono text-xs text-ink-2 break-all">{r.key}</code>
                </td>
                <Cell name={`nb:${r.key}`} defaultValue={r.nb} placeholder={r.nbDefault} label={`Norsk for ${r.key}`} />
                <Cell name={`en:${r.key}`} defaultValue={r.en} placeholder={r.enDefault} label={`English for ${r.key}`} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-rule">
        <SubmitButton pendingLabel="Lagrer …">
          <FiSave aria-hidden /> Lagre
        </SubmitButton>
        <FormStatus
          success={state.success ? `Lagret (${state.changed ?? 0} endret)` : undefined}
          error={state.error}
          className="ml-auto"
        />
      </div>
    </form>
  )
}

function Cell({ name, defaultValue, placeholder, label }: { name: string; defaultValue: string; placeholder: string; label: string }) {
  return (
    <td style={{ padding: '.375rem .5rem', verticalAlign: 'top' }}>
      <Input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        title={defaultValue ? `Standard: ${placeholder}` : undefined}
        className={`text-[0.8125rem] ${defaultValue ? 'border-accent' : ''}`}
      />
    </td>
  )
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '.625rem .875rem', textAlign: 'left', fontSize: '.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)', ...style }}>
      {children}
    </th>
  )
}
