'use client'

import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/Button'

type Props = Omit<ComponentProps<typeof Button>, 'type'> & {
  pendingLabel: string
}

export function SubmitButton({ pendingLabel, children, disabled, ...props }: Props) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  )
}
