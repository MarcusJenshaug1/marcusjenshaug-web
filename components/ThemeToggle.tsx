'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { FiSun, FiMoon } from 'react-icons/fi'
import type { Locale } from '@/lib/i18n/config'
import { useTranslator } from '@/lib/i18n/client'

export function ThemeToggle({ locale }: { locale: Locale }) {
  const t = useTranslator(locale)
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
      aria-label={dark ? t('theme.light') : t('theme.dark')}
    >
      {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  )
}
