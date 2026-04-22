'use client'

import { useActionState } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { updatePassword, type UpdatePasswordState } from '@/app/admin/actions'

const initial: UpdatePasswordState = {}

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, initial)

  return (
    <form action={action} noValidate>
      <FormField label="Nytt passord" htmlFor="password" error={state.error}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending} className="w-full justify-center">
        {pending ? 'Lagrer …' : 'Lagre passord'}
      </Button>
    </form>
  )
}
