'use client'

import { LenisProvider } from '@/components/motion/LenisProvider'
import { TransitionProvider } from '@/components/motion/TransitionProvider'
import { CursorProvider } from '@/components/motion/CursorProvider'
import { Grain } from '@/components/fx/Grain'

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <TransitionProvider>
        <CursorProvider>
          {children}
          <Grain />
        </CursorProvider>
      </TransitionProvider>
    </LenisProvider>
  )
}
