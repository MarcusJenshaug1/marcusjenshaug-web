'use client'

import Link from 'next/link'
import { useTransition } from '@/components/motion/TransitionProvider'

type TransitionLinkProps = React.ComponentProps<typeof Link>

function isModifiedEvent(e: React.MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
}

export function TransitionLink({ href, onClick, ...rest }: TransitionLinkProps) {
  const { navigate } = useTransition()
  const hrefStr = typeof href === 'string' ? href : (href.pathname ?? '/')
  const internal = hrefStr.startsWith('/')

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e)
        if (!internal || isModifiedEvent(e) || e.defaultPrevented) return
        e.preventDefault()
        navigate(hrefStr)
      }}
      {...rest}
    />
  )
}
