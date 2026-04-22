import { createClient } from '@supabase/supabase-js'
import type { AppDatabase } from '@/lib/types/app'

export function createAdminClient() {
  return createClient<AppDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
