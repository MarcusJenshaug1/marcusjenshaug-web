import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  mono?: boolean
}

export function Textarea({ mono = false, className = '', ...props }: Props) {
  return (
    <textarea
      className={`w-full bg-bg-elev border border-rule-strong rounded-md px-3 py-2 text-ink outline-none focus:border-accent transition-colors resize-y ${mono ? 'font-mono text-[0.8125rem] leading-relaxed' : ''} ${className}`}
      {...props}
    />
  )
}
