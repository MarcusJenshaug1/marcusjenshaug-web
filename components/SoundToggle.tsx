'use client'

import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useSound } from '@/components/motion/SoundProvider'
import type { Locale } from '@/lib/i18n/config'
import { useTranslator } from '@/lib/i18n/client'

export function SoundToggle({ locale }: { locale: Locale }) {
  const t = useTranslator(locale)
  const { enabled, setEnabled } = useSound()

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={() => setEnabled(!enabled)}
      aria-label={enabled ? t('sound.off') : t('sound.on')}
      aria-pressed={enabled}
    >
      {enabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
    </button>
  )
}
