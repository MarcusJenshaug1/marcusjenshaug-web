'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { intlLocale } from '@/lib/i18n/client'

function formatOslo(d: Date, locale: Locale) {
  return d.toLocaleString(intlLocale(locale), {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  })
}

export function OsloTerminalLine({ locale = 'nb' }: { locale?: Locale }) {
  const [value, setValue] = useState(() => formatOslo(new Date(), locale))

  useEffect(() => {
    setValue(formatOslo(new Date(), locale))
    const t = setInterval(() => setValue(formatOslo(new Date(), locale)), 30000)
    return () => clearInterval(t)
  }, [locale])

  return (
    <>
      <div>
        <span className="prompt">marcus@redi</span>{' '}
        <span className="str">~/jenshaug</span>{' '}
        $ date +&quot;%A %H:%M&quot;
      </div>
      <div style={{ color: 'var(--term-ink)' }} suppressHydrationWarning>
        {value}
      </div>
    </>
  )
}
