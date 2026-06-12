'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <button type="button" className="nav-icon-btn" aria-hidden tabIndex={-1} />
  }

  const dark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
    >
      {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  )
}
