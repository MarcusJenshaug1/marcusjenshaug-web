import { SafeMdx } from '@/components/SafeMdx'
import { OsloTerminalLine } from '@/components/OsloTerminal'
import type { NowEntry } from '@/lib/types/app'

export function NowTerminal({ entry }: { entry: NowEntry | null }) {
  return (
    <div className="term now-terminal">
      <div className="now-terminal-bar">
        <span className="now-terminal-dot" aria-hidden />
        <span className="now-terminal-title">marcus@redi — ~/na</span>
      </div>
      <div>
        <span className="com">
          # sist oppdatert{' '}
          {entry
            ? new Date(entry.published_at).toLocaleDateString('nb-NO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      </div>
      <div>
        <span className="prompt">marcus@redi</span> <span className="str">~/na</span> $ cat
        status.md
      </div>
      <div className="now-terminal-content">
        {entry ? (
          <SafeMdx source={entry.content} />
        ) : (
          <p className="com">Ingen oppdateringer enda.</p>
        )}
      </div>
      <OsloTerminalLine />
      <div>
        <span className="prompt">marcus@redi</span> <span className="str">~/na</span> ${' '}
        <span className="term-caret" aria-hidden />
      </div>
    </div>
  )
}
