'use client'

import { FiTrash2 } from 'react-icons/fi'
import { Button } from '@/components/Button'

type Props = {
  action: () => Promise<void>
  confirmText?: string
  label?: string
}

export function DeleteButton({ action, confirmText = 'Slette denne oppføringen? Dette kan ikke angres.', label }: Props) {
  return (
    <Button
      type="submit"
      variant="danger"
      size="sm"
      formAction={action}
      formNoValidate
      aria-label={label ? undefined : 'Slett'}
      title={label ? undefined : 'Slett'}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      <FiTrash2 aria-hidden /> {label}
    </Button>
  )
}

export function DeleteInlineForm(props: Props) {
  return (
    <form className="inline">
      <DeleteButton {...props} />
    </form>
  )
}
