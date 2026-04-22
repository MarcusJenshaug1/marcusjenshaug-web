import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUsesItemByIdAdmin, getAllUsesAdmin } from '@/lib/uses'
import { EditUsesForm } from './EditUsesForm'

export const metadata: Metadata = {
  title: 'Rediger uses-oppføring',
  robots: { index: false, follow: false },
}

export default async function EditUsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [item, all] = await Promise.all([getUsesItemByIdAdmin(id), getAllUsesAdmin()])
  if (!item) notFound()

  const categories = Array.from(new Set(all.map((i) => i.category)))

  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/uses" style={{ color: 'inherit' }}>uses</Link> / <span style={{ color: 'var(--ink-2)' }}>{item.name}</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>{item.name}</h1>
      </header>
      <EditUsesForm item={item} existingCategories={categories} />
    </div>
  )
}
