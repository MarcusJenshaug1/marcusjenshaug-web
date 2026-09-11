import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
}

export function Checkbox({ label, className = '', ...props }: Props) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <input type="checkbox" className="w-4 h-4" {...props} />
      {label}
    </label>
  )
}
