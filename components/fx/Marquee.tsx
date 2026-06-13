'use client'

import { useReducedMotion } from '@/lib/motion/useReducedMotion'

type MarqueeProps = {
  children: React.ReactNode
  duration?: number
  reverse?: boolean
  className?: string
}

export function Marquee({ children, duration = 30, reverse = false, className }: MarqueeProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={`marquee-static${className ? ` ${className}` : ''}`}>{children}</div>
  }

  return (
    <div className={`marquee${className ? ` ${className}` : ''}`}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="marquee-content">{children}</div>
        <div className="marquee-content" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
