import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Logg inn',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm bg-bg-elev border border-rule rounded-[10px] p-8">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight mb-6">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
          Admin
        </div>
        <h1 className="text-2xl mb-2">Logg inn</h1>
        <p className="text-ink-3 text-sm mb-6">
          Skriv inn e-post så sender vi deg en innloggingslenke.
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
