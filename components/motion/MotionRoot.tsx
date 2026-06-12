'use client'

import { LenisProvider } from '@/components/motion/LenisProvider'
import { Grain } from '@/components/fx/Grain'

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      {children}
      <Grain />
    </LenisProvider>
  )
}
