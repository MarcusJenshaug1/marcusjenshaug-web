import { useMemo } from 'react'
import { DICTIONARY, type DictionaryKey } from './dictionaries'
import { LOCALES, LOCALE_COOKIE, type Locale } from './config'

// Ren, klientsikker del av i18n: ingen next/cache eller Supabase her, så
// 'use client'-komponenter kan importere den. Serveren bruker den samme
// makeTranslator via lib/i18n/index.ts, men legger på overstyringer fra databasen.

export type Translator = (key: DictionaryKey, vars?: Record<string, string | number>) => string

type Overrides = Partial<Record<DictionaryKey, string>>

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export function makeTranslator(locale: Locale, overrides: Overrides = {}): Translator {
  const base = DICTIONARY[locale]
  const fallback = DICTIONARY.nb
  return (key, vars) => interpolate(overrides[key] ?? base[key] ?? fallback[key] ?? key, vars)
}

export function useTranslator(locale: Locale): Translator {
  return useMemo(() => makeTranslator(locale), [locale])
}

export function otherLocale(locale: Locale): Locale {
  return LOCALES.find((l) => l !== locale) ?? locale
}

// BCP 47-tag til Intl-API-ene (datoer, klokkeslett).
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-GB' : 'nb-NO'
}

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Husker språkvalget i ett år, så middleware sender besøkende rett dit neste gang.
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}
