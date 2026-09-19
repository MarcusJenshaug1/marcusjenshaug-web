'use client'

export type EditorLocale = 'nb' | 'en'

type Props = {
  value: EditorLocale
  onChange: (locale: EditorLocale) => void
  enBadge?: string
}

const TABS: { id: EditorLocale; label: string }[] = [
  { id: 'nb', label: 'Norsk' },
  { id: 'en', label: 'English' },
]

export function LocaleTabs({ value, onChange, enBadge }: Props) {
  return (
    <div role="tablist" aria-label="Språk" className="flex gap-1 border-b border-rule mb-6">
      {TABS.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`-mb-px px-3.5 py-2 text-sm border-b-2 transition-colors ${
              active ? 'border-accent text-ink font-medium' : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.id === 'en' && enBadge && (
              <span className="ml-2 mono text-[0.6875rem] text-ink-4">{enBadge}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
