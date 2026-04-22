import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: Props) {
  return (
    <textarea
      className={`w-full bg-bg-elev border border-rule-strong rounded-md px-3 py-2 text-ink outline-none focus:border-accent transition-colors font-mono text-[0.875rem] ${className}`}
      {...props}
    />
  )
}
