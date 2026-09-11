import { createClient } from '@supabase/supabase-js'
import type { AppDatabase } from '@/lib/types/app'

export function createPublicClient() {
  return createClient<AppDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
