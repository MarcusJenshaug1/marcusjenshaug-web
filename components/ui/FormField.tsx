import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import { Label } from './Label'

type Props = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}

type AriaProps = {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export function FormField({ label, htmlFor, hint, error, children }: Props) {
  const hintId = hint && !error ? `${htmlFor}-hint` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = errorId ?? hintId

  return (
    <div className="mb-5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {Children.map(children, (child, i) =>
        i === 0 && isValidElement<AriaProps>(child)
          ? cloneElement(child, { 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })
          : child
      )}
      {hintId && <p id={hintId} className="mt-1.5 text-xs text-ink-4">{hint}</p>}
      {errorId && <p id={errorId} role="alert" className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  )
}
