import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Ikke autorisert')
  }
  return user
}
