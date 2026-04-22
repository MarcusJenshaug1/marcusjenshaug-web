import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectForm } from '../ProjectForm'

export const metadata: Metadata = {
  title: 'Nytt prosjekt',
  robots: { index: false, follow: false },
}

export default function NyProsjektPage() {
  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/prosjekter" style={{ color: 'inherit' }}>prosjekter</Link> / <span style={{ color: 'var(--ink-2)' }}>ny</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Nytt prosjekt</h1>
      </header>
      <ProjectForm />
    </div>
  )
}
