'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SaveFn = (formData: FormData) => Promise<{ error?: string } | void>

type Options = {
  intervalMs?: number
  enabled?: boolean
}

export function useAutosave(
  formRef: React.RefObject<HTMLFormElement | null>,
  save: SaveFn,
  { intervalMs = 10000, enabled = true }: Options = {}
) {
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const saving = useRef(false)
  const version = useRef(0)

  const markDirty = useCallback(() => {
    version.current += 1
    setDirty(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(async () => {
      if (!dirty || saving.current || !formRef.current) return
      saving.current = true
      const snapshot = version.current
      try {
        const fd = new FormData(formRef.current)
        const res = await save(fd)
        if (!res || !('error' in res && res.error)) {
          if (version.current === snapshot) setDirty(false)
          setSavedAt(new Date())
        }
      } finally {
        saving.current = false
      }
    }, intervalMs)
    return () => clearInterval(timer)
  }, [dirty, save, intervalMs, enabled, formRef])

  return { dirty, savedAt, markDirty }
}
