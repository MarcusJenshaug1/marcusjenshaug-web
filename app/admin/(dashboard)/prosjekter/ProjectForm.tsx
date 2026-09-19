'use client'

import { EditorShell } from '@/components/admin/EditorShell'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ContentTranslation, type Project } from '@/lib/types/app'
import { createProject, updateProject, autosaveProject, deleteProject } from './actions'
import { generateProjectCover } from './cover-actions'

type Props = {
  project?: Project
  translation?: ContentTranslation | null
}

export function ProjectForm({ project, translation }: Props) {
  return (
    <EditorShell
      entity="projects"
      record={project}
      translation={translation}
      action={project ? updateProject.bind(null, project.id) : createProject}
      autosave={autosaveProject}
      onDelete={deleteProject}
      generateCover={project ? (hint) => generateProjectCover(project.id, hint) : undefined}
      previewBase="/prosjekter"
      coverFolder="prosjekter"
      descriptionLabel="Kort beskrivelse"
      descriptionHint="Vises i kort og lister"
      contentPlaceholder={'# Overskrift\n\nTekst her …'}
      publishing={<Checkbox name="featured" label="Vis på forsiden" defaultChecked={project?.featured ?? false} />}
    >
      <section>
        <FormField label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={project?.status ?? 'aktiv'}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Rolle" htmlFor="role" hint="F.eks. «Fullstack-utvikler»">
          <Input id="role" name="role" defaultValue={project?.role ?? ''} />
        </FormField>
        <p className="text-xs text-ink-4 -mt-1">Rekkefølge styres ved å dra prosjektene i listen.</p>
      </section>

      <section>
        <FormField label="Tech-stack" htmlFor="tech_stack" hint="Kommaseparert: Next.js, Supabase, …">
          <Input id="tech_stack" name="tech_stack" mono defaultValue={project?.tech_stack.join(', ') ?? ''} />
        </FormField>
        <FormField label="Live-URL" htmlFor="live_url">
          <Input id="live_url" name="live_url" type="url" defaultValue={project?.live_url ?? ''} placeholder="https://…" />
        </FormField>
        <FormField label="Repo-URL" htmlFor="repo_url">
          <Input id="repo_url" name="repo_url" type="url" defaultValue={project?.repo_url ?? ''} placeholder="https://github.com/…" />
        </FormField>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <FormField label="Startet" htmlFor="started_at">
          <Input id="started_at" name="started_at" type="date" defaultValue={project?.started_at ?? ''} />
        </FormField>
        <FormField label="Avsluttet" htmlFor="ended_at">
          <Input id="ended_at" name="ended_at" type="date" defaultValue={project?.ended_at ?? ''} />
        </FormField>
      </section>
    </EditorShell>
  )
}
