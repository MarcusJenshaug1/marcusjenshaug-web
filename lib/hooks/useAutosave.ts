'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SaveFn = (formData: FormData) => Promise<{ error?: string } | void>

export function useAutosave(formRef: React.RefObject<HTMLFormElement | null>, save: SaveFn, intervalMs = 10000) {
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const saving = useRef(false)

  const markDirty = useCallback(() => setDirty(true), [])

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!dirty || saving.current || !formRef.current) return
      saving.current = true
      try {
        const fd = new FormData(formRef.current)
        const res = await save(fd)
        if (!res || !('error' in res && res.error)) {
          setDirty(false)
          setSavedAt(new Date())
        }
      } finally {
        saving.current = false
      }
    }, intervalMs)
    return () => clearInterval(timer)
  }, [dirty, save, intervalMs, formRef])

  return { dirty, savedAt, markDirty }
}
