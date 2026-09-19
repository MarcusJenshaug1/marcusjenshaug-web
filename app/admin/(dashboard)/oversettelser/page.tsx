import type { Metadata } from 'next'
import { DICTIONARY, type DictionaryKey } from '@/lib/i18n/dictionaries'
import { getUiStringsAdmin } from '@/lib/translations'
import { UiStringsForm, type UiStringRow } from './UiStringsForm'

export const metadata: Metadata = {
  title: 'Oversettelser',
  robots: { index: false, follow: false },
}

export default async function AdminOversettelserPage() {
  const overrides = await getUiStringsAdmin()
  const byKey = new Map(overrides.map((row) => [`${row.locale}:${row.key}`, row.value]))
  const keys = Object.keys(DICTIONARY.nb) as DictionaryKey[]

  const rows: UiStringRow[] = keys.map((key) => ({
    key,
    nbDefault: DICTIONARY.nb[key],
    enDefault: DICTIONARY.en[key],
    nb: byKey.get(`nb:${key}`) ?? '',
    en: byKey.get(`en:${key}`) ?? '',
  }))

  return (
    <div>
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Oversettelser</h1>
        <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
          UI-tekster på den offentlige siden. Tomt felt bruker standardteksten fra koden (vist som plassholder).
        </p>
      </header>
      <UiStringsForm rows={rows} />
    </div>
  )
}
