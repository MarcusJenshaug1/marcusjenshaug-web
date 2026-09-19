'use client'

import { useEffect, useState } from 'react'
import { datetimeLocalToIso, toDatetimeLocal } from '@/lib/datetime'
import { EditorShell } from '@/components/admin/EditorShell'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import type { ContentTranslation, Post } from '@/lib/types/app'
import { createPost, updatePost, autosavePost, deletePost } from './actions'

type Props = {
  post?: Post
  translation?: ContentTranslation | null
}

export function PostForm({ post, translation }: Props) {
  const [publishedAt, setPublishedAt] = useState('')

  useEffect(() => {
    setPublishedAt(toDatetimeLocal(post?.published_at))
  }, [post?.published_at])

  return (
    <EditorShell
      entity="posts"
      record={post}
      translation={translation}
      action={post ? updatePost.bind(null, post.id) : createPost}
      autosave={autosavePost}
      onDelete={deletePost}
      previewBase="/blogg"
      coverFolder="blog"
      descriptionLabel="Ingress"
      descriptionHint="Kort sammendrag, vises i lister og OG-bilde"
      contentRows={24}
      contentPlaceholder={'# Overskrift\n\nTekst her …\n\n```ts\nconst x = 1\n```'}
      publishing={
        <FormField label="Publiseringstidspunkt" htmlFor="published_at" hint="Sett fremtidig dato for planlagt publisering">
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
          <input type="hidden" name="published_at_iso" value={datetimeLocalToIso(publishedAt)} />
        </FormField>
      }
    >
      <section>
        <FormField label="Tags" htmlFor="tags" hint="Kommaseparert">
          <Input id="tags" name="tags" mono defaultValue={post?.tags.join(', ') ?? ''} />
        </FormField>
      </section>
    </EditorShell>
  )
}
