'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isLocale, localePath, routeKeyFromSegment, type Locale } from '@/lib/i18n/config'
import { otherLocale, setLocaleCookie, useTranslator } from '@/lib/i18n/client'

const SHORT: Record<Locale, string> = { nb: 'NO', en: 'EN' }

// Finner samme side på det andre språket. Rekkefølge: eksplisitt sti fra siden,
// deretter <link rel="alternate" hreflang> i <head> (satt av generateMetadata,
// og eneste som kjenner oversatt slug), ellers indeks-siden for ruten.
export function useAlternatePath(locale: Locale, override?: string): string {
  const pathname = usePathname()
  const other = otherLocale(locale)
  const [fromHead, setFromHead] = useState<string | null>(null)

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${other}"]`
    )
    if (!link) {
      setFromHead(null)
      return
    }
    try {
      setFromHead(new URL(link.href, window.location.origin).pathname)
    } catch {
      setFromHead(null)
    }
  }, [pathname, other])

  if (override) return override
  if (fromHead) return fromHead

  const [first = '', second = ''] = pathname.split('/').filter(Boolean)
  const key = isLocale(first) ? routeKeyFromSegment(second) : routeKeyFromSegment(first)
  return localePath(other, key ?? 'home')
}

type Props = {
  locale: Locale
  alternatePath?: string
}

export function LocaleSwitch({ locale, alternatePath }: Props) {
  const t = useTranslator(locale)
  const href = useAlternatePath(locale, alternatePath)

  return (
    <nav className="locale-switch mono" aria-label={t('nav.language')}>
      {locale === 'nb' ? (
        <span aria-current="true">{SHORT.nb}</span>
      ) : (
        <a href={href} hrefLang="nb" lang="nb" aria-label={t('nav.switchTo.nb')} onClick={() => setLocaleCookie('nb')}>
          {SHORT.nb}
        </a>
      )}
      <span className="locale-switch-sep" aria-hidden>
        |
      </span>
      {locale === 'en' ? (
        <span aria-current="true">{SHORT.en}</span>
      ) : (
        <a href={href} hrefLang="en" lang="en" aria-label={t('nav.switchTo.en')} onClick={() => setLocaleCookie('en')}>
          {SHORT.en}
        </a>
      )}
    </nav>
  )
}
