'use client'

import { useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FiUpload, FiX } from 'react-icons/fi'
import { createUploadUrl } from '@/app/admin/upload-actions'
import { Button } from '@/components/Button'
import { Input } from './Input'

const MAX_MB = 8
const BUCKET = 'media'

type Props = {
  name: string
  value: string
  onChange: (value: string) => void
  id?: string
  folder?: string
  placeholder?: string
}

export function ImageUploader({ name, value, onChange, id, folder = 'misc', placeholder }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Bildet er for stort (maks ${MAX_MB} MB)`)
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Filen må være et bilde')
      return
    }

    setUploading(true)
    try {
      const signed = await createUploadUrl(folder, file.name)
      if (!signed.ok) {
        setError(signed.error)
        return
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      onChange(signed.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukjent feil')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-2 items-stretch">
        <Input
          id={id}
          type="text"
          mono
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'URL eller last opp'}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <FiUpload aria-hidden /> {uploading ? 'Laster opp …' : 'Last opp'}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')} aria-label="Fjern bilde" title="Fjern">
            <FiX aria-hidden />
          </Button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
        className="hidden"
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-accent">{error}</p>}
      {value && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Forhåndsvisning" className="mt-2 max-w-60 max-h-40 border border-rule rounded-md" />
      )}
    </div>
  )
}
