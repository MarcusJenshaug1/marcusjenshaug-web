import { SafeMdx } from '@/components/SafeMdx'
import { OsloTerminalLine } from '@/components/OsloTerminal'
import { intlLocale, type Translator } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/config'
import type { NowEntry } from '@/lib/types/app'

type Props = {
  locale: Locale
  t: Translator
  entry: NowEntry | null
}

export function NowTerminal({ locale, t, entry }: Props) {
  const updated = entry
    ? new Date(entry.published_at).toLocaleDateString(intlLocale(locale), {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Oslo',
      })
    : null

  return (
    <div className="term now-terminal">
      <div className="now-terminal-bar">
        <span className="now-terminal-dot" aria-hidden />
        <span className="now-terminal-title">marcus@redi — ~/na</span>
      </div>
      <div>
        <span className="com">
          # {t('now.lastUpdated')}{' '}
          {entry && updated ? <time dateTime={entry.published_at}>{updated}</time> : '—'}
        </span>
      </div>
      <div>
        <span className="prompt">marcus@redi</span> <span className="str">~/na</span> $ cat
        status.md
      </div>
      <div className="now-terminal-content">
        {entry ? (
          <SafeMdx source={entry.content} locale={locale} />
        ) : (
          <p className="com">{t('now.empty')}</p>
        )}
      </div>
      <OsloTerminalLine locale={locale} />
      <div>
        <span className="prompt">marcus@redi</span> <span className="str">~/na</span> ${' '}
        <span className="term-caret" aria-hidden />
      </div>
    </div>
  )
}
