import { createClient } from '@supabase/supabase-js'

const email = process.env.ADMIN_EMAIL
const password = process.argv[2] ?? process.env.ADMIN_PASSWORD

if (!email) {
  console.error('✗ ADMIN_EMAIL mangler i .env.local')
  process.exit(1)
}

if (!password) {
  console.error('✗ Passord mangler.')
  console.error('  Sett ADMIN_PASSWORD i .env.local, eller kjør:')
  console.error('  npm run set-admin-password -- "<passord>"')
  process.exit(1)
}

if (password.length < 8) {
  console.error('✗ Passordet må være minst 8 tegn.')
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY mangler i .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data, error: listError } = await supabase.auth.admin.listUsers()
if (listError) {
  console.error('✗ Kunne ikke hente brukere:', listError.message)
  process.exit(1)
}

const existing = data.users.find((u) => u.email === email)

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { password })
  if (error) {
    console.error('✗ Kunne ikke oppdatere passord:', error.message)
    process.exit(1)
  }
  console.log(`✓ Passord oppdatert for ${email}`)
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('✗ Kunne ikke opprette bruker:', error.message)
    process.exit(1)
  }
  console.log(`✓ Bruker opprettet: ${email}`)
}

console.log('')
console.log('  Husk å slette ADMIN_PASSWORD fra .env.local etter bruk.')
