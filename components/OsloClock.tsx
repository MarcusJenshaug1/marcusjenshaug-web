'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { intlLocale } from '@/lib/i18n/client'

function osloTime(d: Date, locale: Locale) {
  return d.toLocaleTimeString(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  })
}

export function OsloClock({ locale = 'nb' }: { locale?: Locale }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(osloTime(new Date(), locale))
    const t = setInterval(() => setTime(osloTime(new Date(), locale)), 30000)
    return () => clearInterval(t)
  }, [locale])

  return <>{time}</>
}
