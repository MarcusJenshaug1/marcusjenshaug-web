'use client'

import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/config'
import { readCookie, setLocaleCookie, useTranslator } from '@/lib/i18n/client'
import { useAlternatePath } from '@/components/LocaleSwitch'

const HINT_COOKIE = 'mj-locale-hint'
const SESSION_KEY = 'mj-locale-banner'

// Stripe for svensker og dansker som har fått norsk av middleware (cookie
// mj-locale-hint=nordic) uten å ha valgt språk selv. Monteres først etter
// hydrering, så SSR-utdata er identisk for alle.
export function LocaleBanner({ locale }: { locale: Locale }) {
  const t = useTranslator(locale)
  const englishPath = useAlternatePath(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (locale !== 'nb') return
    if (readCookie(HINT_COOKIE) !== 'nordic' || readCookie(LOCALE_COOKIE)) return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // Ingen sessionStorage: vis banneret likevel.
    }
    setVisible(true)
  }, [locale])

  const close = () => {
    setVisible(false)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Ignorer.
    }
  }

  const keepNorwegian = () => {
    setLocaleCookie('nb')
    close()
  }

  if (!visible) return null

  return (
    <div className="locale-banner mono" role="region" aria-label={t('nav.language')}>
      <span>{t('locale.banner.nordic')}</span>
      <a href={englishPath} hrefLang="en" lang="en" onClick={() => setLocaleCookie('en')}>
        {t('locale.banner.switch')}
      </a>
      <button type="button" onClick={keepNorwegian}>
        {t('locale.banner.dismiss')}
      </button>
      <button type="button" className="locale-banner-close" onClick={close} aria-label={t('nav.close')}>
        <FiX size={14} aria-hidden />
      </button>
    </div>
  )
}
