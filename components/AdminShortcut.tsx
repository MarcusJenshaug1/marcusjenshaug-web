'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function AdminShortcut() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        const target = pathname.startsWith('/admin') ? '/' : '/admin'
        router.push(target)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pathname, router])

  return null
}
