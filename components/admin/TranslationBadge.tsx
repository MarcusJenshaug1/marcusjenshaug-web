import { FiCheck, FiCpu } from 'react-icons/fi'
import type { ContentTranslation } from '@/lib/types/app'

export type TranslationStatus = 'reviewed' | 'machine' | 'none'

export function translationStatus(t: ContentTranslation | null | undefined): TranslationStatus {
  if (!t) return 'none'
  return t.machine_translated ? 'machine' : 'reviewed'
}

const LABELS: Record<TranslationStatus, string> = {
  reviewed: 'Engelsk oversettelse gjennomgått',
  machine: 'Maskinoversatt, ikke gjennomgått',
  none: 'Ingen engelsk oversettelse',
}

export function TranslationBadge({ status }: { status: TranslationStatus }) {
  const title = LABELS[status]
  if (status === 'none') {
    return (
      <span className="mono dim text-xs" title={title}>
        —<span className="sr-only"> {title}</span>
      </span>
    )
  }
  return (
    <span className="chip inline-flex items-center gap-1" title={title}>
      {status === 'reviewed' ? <FiCheck aria-hidden size={12} /> : <FiCpu aria-hidden size={12} />}
      {status === 'reviewed' ? 'EN' : 'maskin'}
      <span className="sr-only"> {title}</span>
    </span>
  )
}
