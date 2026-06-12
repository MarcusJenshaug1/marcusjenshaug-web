'use client'

import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useSound } from '@/components/motion/SoundProvider'

export function SoundToggle() {
  const { enabled, setEnabled } = useSound()

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={() => setEnabled(!enabled)}
      aria-label={enabled ? 'Skru av lyd' : 'Skru på lyd'}
      aria-pressed={enabled}
    >
      {enabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
    </button>
  )
}
