import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) {
    return null
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser()
  if (!user) throw new Error('Ikke autorisert')
  return user
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null
}
