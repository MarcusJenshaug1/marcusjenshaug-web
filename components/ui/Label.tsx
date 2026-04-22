import type { LabelHTMLAttributes, ReactNode } from 'react'

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
}

export function Label({ className = '', children, ...props }: Props) {
  return (
    <label
      className={`block text-xs uppercase tracking-[0.12em] text-ink-3 font-medium mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
