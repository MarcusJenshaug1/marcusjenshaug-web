'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { TAGS, projectTag } from '@/lib/cache-tags'
import { buildSubjectRequest, composeCoverPrompt, SUBJECT_SYSTEM_PROMPT } from '@/lib/cover-prompt'
import { generateImage, writeText } from '@/lib/openai'

const BUCKET = 'media'

export type GenerateCoverResult = { url: string; subject: string } | { error: string }

export async function generateProjectCover(id: string, hint = ''): Promise<GenerateCoverResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Ikke autorisert' }
  }

  const admin = createAdminClient()
  const { data: project, error } = await admin
    .from('projects')
    .select('id, slug, title, description, content')
    .eq('id', id)
    .maybeSingle()
  if (error || !project) return { error: 'Fant ikke prosjektet' }

  try {
    const subject = await writeText(
      SUBJECT_SYSTEM_PROMPT,
      buildSubjectRequest({
        title: project.title,
        description: project.description,
        content: project.content,
        hint: hint.slice(0, 500),
      })
    )
    const image = await generateImage(composeCoverPrompt(subject))

    const path = `prosjekter/${crypto.randomUUID()}.webp`
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, image.bytes, { contentType: image.contentType, upsert: false })
    if (uploadError) return { error: `Opplasting feilet: ${uploadError.message}` }

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path)
    const url = urlData.publicUrl

    const { error: updateError } = await admin
      .from('projects')
      .update({ cover_image: url, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (updateError) return { error: `Kunne ikke lagre cover: ${updateError.message}` }

    revalidateTag(TAGS.projects)
    revalidateTag(projectTag(project.slug))
    revalidatePath('/admin/prosjekter')

    return { url, subject }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Generering feilet' }
  }
}
