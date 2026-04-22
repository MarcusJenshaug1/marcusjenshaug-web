import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = {
  title: 'Innstillinger',
  robots: { index: false, follow: false },
}

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl mb-1">Innstillinger</h1>
        <p className="text-ink-3 text-sm">
          Kontaktinfo, bio og sosiale lenker. Brukes på forside, /om og i Person-schema.
        </p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  )
}
