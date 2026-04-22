import type { Metadata } from 'next'
import { ResetForm } from './ResetForm'

export const metadata: Metadata = {
  title: 'Nytt passord',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm bg-bg-elev border border-rule rounded-[10px] p-8">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight mb-6">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
          Admin
        </div>
        <h1 className="text-2xl mb-2">Sett nytt passord</h1>
        <p className="text-ink-3 text-sm mb-6">
          Minst 8 tegn. Etter lagring blir du sendt til admin-panelet.
        </p>
        <ResetForm />
      </div>
    </main>
  )
}
