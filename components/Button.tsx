import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'primary' | 'accent' | 'ghost'
type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const base =
  'inline-flex items-center gap-2 font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  default: 'bg-bg-elev text-ink border-rule-strong hover:bg-bg-sunken',
  primary: 'bg-ink text-bg-elev border-ink hover:bg-ink-2 hover:border-ink-2',
  accent: 'bg-accent text-white border-accent hover:opacity-90',
  ghost: 'bg-transparent border-transparent text-ink-3 hover:bg-bg-sunken hover:text-ink',
}

const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-[0.8125rem] rounded-[5px]',
  md: 'px-3.5 py-2 text-sm rounded-md',
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
