'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'media'

export type UploadUrlResult =
  | { ok: true; signedUrl: string; token: string; path: string; publicUrl: string }
  | { ok: false; error: string }

export async function createUploadUrl(
  folder: string,
  filename: string
): Promise<UploadUrlResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false, error: 'Ikke autorisert' }
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'misc'
  const ext = filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
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
