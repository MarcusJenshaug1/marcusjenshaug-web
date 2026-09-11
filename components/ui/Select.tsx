import type { SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className = '', ...props }: Props) {
  return (
    <select
      className={`w-full bg-bg-elev border border-rule-strong rounded-md px-3 py-2 text-ink outline-none focus:border-accent transition-colors ${className}`}
      {...props}
    />
  )
}
