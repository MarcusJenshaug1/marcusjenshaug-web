import type { ReactNode } from 'react'
import { Label } from './Label'

type Props = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="mb-5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-4">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  )
}
