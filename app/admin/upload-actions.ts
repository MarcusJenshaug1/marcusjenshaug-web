'use server'

import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'media'
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']

export type UploadUrlResult =
  | { ok: true; signedUrl: string; token: string; path: string; publicUrl: string }
  | { ok: false; error: string }

export async function createUploadUrl(
  folder: string,
  filename: string
): Promise<UploadUrlResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: 'Ikke autorisert' }
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'misc'
  const ext = filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `Filtypen støttes ikke. Bruk ${ALLOWED_EXTENSIONS.join(', ')}.` }
  }
  const path = `${safeFolder}/${crypto.randomUUID()}.${ext}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Kunne ikke generere opplastings-URL' }
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(data.path)

  return {
    ok: true,
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: urlData.publicUrl,
  }
}
