import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: Props) {
  return (
    <input
      className={`w-full bg-bg-elev border border-rule-strong rounded-md px-3 py-2 text-ink outline-none focus:border-accent transition-colors ${className}`}
      {...props}
    />
  )
}
