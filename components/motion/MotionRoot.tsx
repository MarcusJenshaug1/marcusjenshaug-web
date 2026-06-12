'use client'

import { LenisProvider } from '@/components/motion/LenisProvider'
import { TransitionProvider } from '@/components/motion/TransitionProvider'
import { Grain } from '@/components/fx/Grain'

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <TransitionProvider>
        {children}
        <Grain />
      </TransitionProvider>
    </LenisProvider>
  )
}
