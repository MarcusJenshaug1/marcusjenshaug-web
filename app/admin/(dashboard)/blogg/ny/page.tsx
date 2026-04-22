import type { Metadata } from 'next'
import Link from 'next/link'
import { PostForm } from '../PostForm'

export const metadata: Metadata = {
  title: 'Nytt innlegg',
  robots: { index: false, follow: false },
}

export default function NyPostPage() {
  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/blogg" style={{ color: 'inherit' }}>blogg</Link> / <span style={{ color: 'var(--ink-2)' }}>ny</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <h1 style={{ fontSize: '1.375rem' }}>Nytt innlegg</h1>
      </header>
      <PostForm />
    </div>
  )
}
