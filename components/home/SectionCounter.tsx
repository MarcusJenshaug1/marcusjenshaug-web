'use client'

import { useEffect, useState } from 'react'
import { ScrollTrigger } from '@/lib/motion/gsap'

function pad(n: number) {
  return String(n).padStart(3, '0')
}

export function SectionCounter() {
  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(1)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
    setTotal(sections.length || 1)

    const triggers = sections.map((section, i) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setCurrent(i + 1)
        },
      })
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <span className="mono tabular" suppressHydrationWarning>
      {pad(current)} / {pad(total)}
    </span>
  )
}
