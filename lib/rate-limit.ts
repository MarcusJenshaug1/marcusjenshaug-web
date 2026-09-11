import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getClientIp(): Promise<string> {
  const headerList = await headers()
  return (
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  )
}

export async function recordRateLimitHit(bucket: string): Promise<void> {
  const admin = createAdminClient()
  await admin.from('rate_limits').insert({ bucket })
}

export async function checkRateLimit(
  bucket: string,
  limit: number,
  windowMinutes: number,
  { record = true }: { record?: boolean } = {}
): Promise<{ allowed: boolean }> {
  const admin = createAdminClient()
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

  const { count } = await admin
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .gte('created_at', since)

  if ((count ?? 0) >= limit) return { allowed: false }

  if (record) await recordRateLimitHit(bucket)
  return { allowed: true }
}
