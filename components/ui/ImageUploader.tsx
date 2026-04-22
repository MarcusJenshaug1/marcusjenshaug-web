'use client'

import { useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FiUpload, FiX } from 'react-icons/fi'
import { createUploadUrl } from '@/app/admin/upload-actions'

const MAX_MB = 8
const BUCKET = 'media'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.5625rem .75rem',
  border: '1px solid var(--rule-strong)',
  borderRadius: '6px',
  background: 'var(--bg-elev)',
  fontFamily: 'var(--ff-mono)',
  fontSize: '.8125rem',
}

type Props = {
  name: string
  value: string
  onChange: (value: string) => void
  folder?: string
  placeholder?: string
}

export function ImageUploader({ name, value, onChange, folder = 'misc', placeholder }: Props) {
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
      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'stretch' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'URL eller last opp'}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <FiUpload /> {uploading ? 'Laster opp …' : 'Last opp'}
        </button>
        {value && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => onChange('')}
            title="Fjern"
          >
            <FiX />
          </button>
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
        style={{ display: 'none' }}
      />
      {error && (
        <p style={{ marginTop: '.375rem', fontSize: '.75rem', color: 'var(--accent)' }}>{error}</p>
      )}
      {value && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Forhåndsvisning"
          style={{ marginTop: '.5rem', maxWidth: '240px', maxHeight: '160px', border: '1px solid var(--rule)', borderRadius: '6px' }}
        />
      )}
    </div>
  )
}
