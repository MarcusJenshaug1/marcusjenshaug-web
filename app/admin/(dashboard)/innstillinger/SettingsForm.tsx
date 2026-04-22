'use client'

import { useActionState, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import type { SiteSettings, SocialLink } from '@/lib/types/app'
import { updateSettings, type SettingsState } from './actions'

const initial: SettingsState = {}

type Props = {
  settings: SiteSettings
}

export function SettingsForm({ settings }: Props) {
  const [state, action, pending] = useActionState(updateSettings, initial)
  const [links, setLinks] = useState<SocialLink[]>(settings.social_links)

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
        <Textarea id="bio_long" name="bio_long" defaultValue={settings.bio_long} rows={10} required />
      </FormField>

      <FormField label="E-post" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={settings.email} required />
      </FormField>

      <FormField label="Lokasjon" htmlFor="location">
        <Input id="location" name="location" defaultValue={settings.location ?? ''} />
      </FormField>

      <FormField label="Tilgjengelig for arbeid" htmlFor="available_for_work">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            id="available_for_work"
            name="available_for_work"
            type="checkbox"
            defaultChecked={settings.available_for_work}
            className="w-4 h-4"
          />
          Vis «åpen for samarbeid»-merke
        </label>
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
                placeholder="platform (linkedin, github …)"
                value={link.platform}
                onChange={(e) => updateLink(i, 'platform', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="https://…"
                value={link.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                className="flex-[2]"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="px-2 text-ink-3 hover:text-ink"
                aria-label="Fjern"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>
            <FiPlus size={14} /> Legg til lenke
          </Button>
        </div>
      </fieldset>

      <div className="flex items-center gap-4 mt-8">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Lagrer …' : 'Lagre'}
        </Button>
        {state.success && <span className="text-sm text-ink-3">Lagret.</span>}
        {state.error && <span className="text-sm text-accent">{state.error}</span>}
      </div>
    </form>
  )
}
