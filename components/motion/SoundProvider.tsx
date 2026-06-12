'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { playSound, type SoundType } from '@/lib/sound/synth'

const STORAGE_KEY = 'mj-sound'

type SoundContextValue = {
  enabled: boolean
  setEnabled: (value: boolean) => void
  play: (type: SoundType) => void
}

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  setEnabled: () => {},
  play: () => {},
})

export function useSound() {
  return useContext(SoundContext)
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    setEnabledState(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  useEffect(() => {
    if (!enabled) return
    let hovered: Element | null = null

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, [role="button"]')
      if (target && target !== hovered) {
        hovered = target
        playSound('hover')
      } else if (!target) {
        hovered = null
      }
    }
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"]')) playSound('click')
    }

    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('click', onClick, { passive: true })
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick)
    }
  }, [enabled])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    if (value) playSound('toggle')
  }, [])

  const play = useCallback(
    (type: SoundType) => {
      if (enabled) playSound(type)
    },
    [enabled]
  )

  return (
    <SoundContext.Provider value={{ enabled, setEnabled, play }}>
      {children}
    </SoundContext.Provider>
  )
}
