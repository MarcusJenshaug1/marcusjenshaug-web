import type { ReactNode } from 'react'
import { FiCheck } from 'react-icons/fi'

type Props = {
  success?: string
  error?: string
  children?: ReactNode
  className?: string
}

export function FormStatus({ success, error, children, className = '' }: Props) {
  return (
    <div className={`text-sm ${className}`}>
      {error ? (
        <span role="alert" className="text-accent">{error}</span>
      ) : success ? (
        <span role="status" className="inline-flex items-center gap-1 text-ink-3">
          <FiCheck aria-hidden /> {success}
        </span>
      ) : (
        children
      )}
    </div>
  )
}
