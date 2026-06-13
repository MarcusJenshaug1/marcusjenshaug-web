'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const SCRAMBLE_CHARS = '01<>/\\_-[]{}#$%&'

export function RoleRotator({ roles }: { roles: string[] }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || roles.length < 2) return

    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % roles.length
      gsap.to(el, {
        scrambleText: { text: roles[index], chars: SCRAMBLE_CHARS, speed: 0.7 },
        duration: 0.9,
        ease: 'none',
      })
    }, 3000)

    return () => {
      clearInterval(interval)
      gsap.killTweensOf(el)
      el.textContent = roles[0]
    }
  }, [roles, reduced])

  return (
    <span ref={ref} className="role-rotator" aria-label={roles.join(', ')}>
      {roles[0]}
    </span>
  )
}
