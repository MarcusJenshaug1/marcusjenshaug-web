import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostByIdAdmin } from '@/lib/posts'
import { getTranslationAdmin } from '@/lib/translations'
import { formatDate } from '@/lib/site'
import { PostForm } from '../PostForm'

export const metadata: Metadata = {
  title: 'Rediger innlegg',
  robots: { index: false, follow: false },
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostByIdAdmin(id)
  if (!post) notFound()
  const translation = await getTranslationAdmin('posts', post.id, 'en')

  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/blogg" style={{ color: 'inherit' }}>blogg</Link> / <span style={{ color: 'var(--ink-2)' }}>{post.slug}</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>{post.title}</h1>
          <p className="dim mono" style={{ fontSize: '.75rem', marginTop: '.25rem' }}>
            {post.draft ? 'Utkast' : 'Publisert'} · sist endret {formatDate(post.updated_at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>
      <PostForm post={post} translation={translation} />
    </div>
  )
}
