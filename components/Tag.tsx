import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  variant?: 'default' | 'accent'
}

export function Tag({ children, variant = 'default' }: Props) {
  const styles =
    variant === 'accent'
      ? 'text-accent-ink bg-accent-bg'
      : 'text-ink-3 bg-bg-sunken'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono rounded ${styles}`}
    >
      {children}
    </span>
  )
}
