import type { Metadata } from 'next'
import { RootDocument } from '@/app/RootDocument'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument lang="nb">
      <div className="light min-h-screen bg-bg text-ink">{children}</div>
    </RootDocument>
  )
}
