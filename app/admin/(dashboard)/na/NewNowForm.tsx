'use client'

import { useActionState, useRef, useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { FormField } from '@/components/ui/FormField'
import { FormStatus } from '@/components/ui/FormStatus'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Textarea } from '@/components/ui/Textarea'
import { createNowEntry, type NowFormState } from './actions'

const initial: NowFormState = {}

export function NewNowForm() {
  const [state, action] = useActionState(createNowEntry, initial)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={action}>
      <FormField label="Innhold" htmlFor="content">
        <Textarea
          id="content"
          name="content"
          mono
          required
          rows={4}
          placeholder="Hva jobber du med akkurat nå? Markdown/MDX støttet."
        />
      </FormField>
      <div className="flex items-center gap-4">
        <SubmitButton pendingLabel="Publiserer …">
          Publiser <FiArrowRight aria-hidden />
        </SubmitButton>
        <FormStatus success={state.success ? 'Publisert' : undefined} error={state.error} />
      </div>
    </form>
  )
}
