import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PublicShell } from '@/components/PublicShell'
import { RootDocument } from '@/app/RootDocument'
import { NotFoundTerminal } from '@/app/NotFoundTerminal'
import { DEFAULT_LOCALE, HTML_LANG, LOCALE_COOKIE, getTranslator, isLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: '404',
  robots: { index: false, follow: false },
}

// Rot-not-found har ingen params; språket hentes fra cookien.
export default async function NotFound() {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE
  const t = await getTranslator(locale)

  return (
    <RootDocument lang={HTML_LANG[locale]} skipLabel={t('skip')}>
      <PublicShell locale={locale}>
        <NotFoundTerminal locale={locale} />
      </PublicShell>
    </RootDocument>
  )
}
