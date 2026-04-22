import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/lib/types/app'

type Props = {
  status: ProjectStatus
  accent?: boolean
}

export function StatusChip({ status, accent }: Props) {
  return (
    <span className={accent ? 'chip chip-accent' : 'chip'}>
      {accent && <span className="chip-dot" />}
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
