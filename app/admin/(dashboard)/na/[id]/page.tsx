import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNowByIdAdmin } from '@/lib/now'
import { EditNowForm } from './EditNowForm'

export const metadata: Metadata = {
  title: 'Rediger nå-oppføring',
  robots: { index: false, follow: false },
}

export default async function EditNowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = await getNowByIdAdmin(id)
  if (!entry) notFound()

  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/na" style={{ color: 'inherit' }}>nå</Link> / <span style={{ color: 'var(--ink-2)' }}>rediger</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Rediger nå-oppføring</h1>
      </header>
      <EditNowForm entry={entry} />
    </div>
  )
}
