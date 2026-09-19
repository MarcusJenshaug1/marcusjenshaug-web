'use client'

import { useActionState, useState, useTransition } from 'react'
import { FiPlus, FiX, FiZap } from 'react-icons/fi'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import type { SiteSettings, SocialLink } from '@/lib/types/app'
import { updateSettings, type SettingsState } from './actions'
import { aiTranslateSettings, type SettingsTranslation } from '../translations-actions'

const initial: SettingsState = {}

type Props = {
  settings: SiteSettings
}

export function SettingsForm({ settings }: Props) {
  const [state, action] = useActionState(updateSettings, initial)
  const [links, setLinks] = useState<SocialLink[]>(settings.social_links)
  const [en, setEn] = useState<SettingsTranslation>({
    headline_en: settings.headline_en,
    bio_short_en: settings.bio_short_en,
    bio_long_en: settings.bio_long_en,
    location_en: settings.location_en ?? '',
    availability_note_en: settings.availability_note_en ?? '',
  })
  const [aiError, setAiError] = useState<string | null>(null)
  const [translating, startTranslating] = useTransition()

  const setEnField = (field: keyof SettingsTranslation, value: string) => setEn((v) => ({ ...v, [field]: value }))

  function handleAiTranslate() {
    setAiError(null)
    startTranslating(async () => {
      const result = await aiTranslateSettings()
      if ('error' in result) {
        setAiError(result.error)
        return
      }
      setEn(result.fields)
    })
  }

  const addLink = () => setLinks([...links, { platform: '', url: '' }])
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i))
  const updateLink = (i: number, field: keyof SocialLink, value: string) => {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }

  return (
    <form action={action}>
      <input type="hidden" name="social_links" value={JSON.stringify(links)} />
      <input type="hidden" name="image_url" value={settings.image_url ?? '/portrett.jpg'} />

      <FormField label="Fullt navn" htmlFor="full_name">
        <Input id="full_name" name="full_name" defaultValue={settings.full_name} required />
      </FormField>

      <FormField label="Tittel / headline" htmlFor="headline" hint="F.eks. «Fullstack-utvikler i Redi AS»">
        <Input id="headline" name="headline" defaultValue={settings.headline} required />
      </FormField>

      <FormField label="Kort bio" htmlFor="bio_short" hint="1–2 setninger til hero på forsiden">
        <Textarea id="bio_short" name="bio_short" defaultValue={settings.bio_short} rows={3} required />
      </FormField>

      <FormField label="Lang bio (MDX)" htmlFor="bio_long" hint="Full om-side-tekst. Støtter markdown/MDX.">
        <Textarea id="bio_long" name="bio_long" mono defaultValue={settings.bio_long} rows={10} required />
      </FormField>

      <FormField label="E-post" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={settings.email} required />
      </FormField>

      <FormField label="Lokasjon" htmlFor="location">
        <Input id="location" name="location" defaultValue={settings.location ?? ''} />
      </FormField>

      <FormField label="Tilgjengelig for arbeid" htmlFor="available_for_work">
        <Checkbox
          id="available_for_work"
          name="available_for_work"
          defaultChecked={settings.available_for_work}
          label="Vis «åpen for samarbeid»-merke"
        />
      </FormField>

      <FormField label="Tilgjengelighetsnotat" htmlFor="availability_note" hint="F.eks. «Åpen for samarbeid Q3 2026»">
        <Input id="availability_note" name="availability_note" defaultValue={settings.availability_note ?? ''} />
      </FormField>

      <FormField label="CV-URL" htmlFor="cv_url">
        <Input id="cv_url" name="cv_url" type="url" defaultValue={settings.cv_url ?? ''} placeholder="https://..." />
      </FormField>

      <fieldset className="mb-5">
        <legend className="block text-xs uppercase tracking-[0.12em] text-ink-3 font-medium mb-3">
          Sosiale lenker
        </legend>
        <div className="flex flex-col gap-3">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label={`Plattform for lenke ${i + 1}`}
                placeholder="platform (linkedin, github …)"
                value={link.platform}
                onChange={(e) => updateLink(i, 'platform', e.target.value)}
                className="flex-1"
              />
              <Input
                aria-label={`URL for lenke ${i + 1}`}
                type="url"
                placeholder="https://…"
                value={link.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                className="flex-[2]"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(i)} aria-label={`Fjern lenke ${i + 1}`}>
                <FiX size={16} aria-hidden />
              </Button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addLink} className="self-start">
            <FiPlus size={14} aria-hidden /> Legg til lenke
          </Button>
        </div>
      </fieldset>

      <section className="mb-5 mt-8 pt-6 border-t border-rule">
        <h2 className="text-xs uppercase tracking-[0.12em] text-ink-3 font-medium mb-3">English</h2>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Button type="button" size="sm" onClick={handleAiTranslate} disabled={translating}>
            <FiZap aria-hidden /> {translating ? 'Oversetter …' : 'Oversett med AI'}
          </Button>
          {aiError && <p role="alert" className="text-xs text-accent">{aiError}</p>}
          <p className="text-xs text-ink-4 basis-full">
            Fyller feltene under fra de norske tekstene. Ingenting lagres før du trykker Lagre.
          </p>
        </div>

        <FormField label="Headline (engelsk)" htmlFor="headline_en">
          <Input id="headline_en" name="headline_en" value={en.headline_en} onChange={(e) => setEnField('headline_en', e.target.value)} disabled={translating} />
        </FormField>

        <FormField label="Kort bio (engelsk)" htmlFor="bio_short_en">
          <Textarea id="bio_short_en" name="bio_short_en" rows={3} value={en.bio_short_en} onChange={(e) => setEnField('bio_short_en', e.target.value)} disabled={translating} />
        </FormField>

        <FormField label="Lang bio (engelsk, MDX)" htmlFor="bio_long_en">
          <Textarea id="bio_long_en" name="bio_long_en" mono rows={10} value={en.bio_long_en} onChange={(e) => setEnField('bio_long_en', e.target.value)} disabled={translating} />
        </FormField>

        <FormField label="Lokasjon (engelsk)" htmlFor="location_en">
          <Input id="location_en" name="location_en" value={en.location_en} onChange={(e) => setEnField('location_en', e.target.value)} disabled={translating} />
        </FormField>

        <FormField label="Tilgjengelighetsnotat (engelsk)" htmlFor="availability_note_en">
          <Input id="availability_note_en" name="availability_note_en" value={en.availability_note_en} onChange={(e) => setEnField('availability_note_en', e.target.value)} disabled={translating} />
        </FormField>
      </section>

      <div className="flex items-center gap-4 mt-8">
        <SubmitButton pendingLabel="Lagrer …" disabled={translating}>Lagre</SubmitButton>
        <FormStatus success={state.success ? 'Lagret' : undefined} error={state.error} />
      </div>
    </form>
  )
}
