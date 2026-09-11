'use client'

import { useActionState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { updatePassword, type UpdatePasswordState } from '@/app/admin/actions'

const initial: UpdatePasswordState = {}

export function ResetForm() {
  const [state, action] = useActionState(updatePassword, initial)

  return (
    <form action={action} noValidate>
      <FormField label="Nytt passord" htmlFor="password" error={state.error}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </FormField>
      <SubmitButton pendingLabel="Lagrer …" className="w-full justify-center">
        Lagre passord <FiArrowRight aria-hidden />
      </SubmitButton>
      <p className="dim text-xs mt-3.5 text-center leading-normal">
        Minst 8 tegn. Etter lagring blir du sendt til admin-panelet.
      </p>
    </form>
  )
}
