import type { Metadata } from 'next'
import { NotFoundTerminal } from '@/app/NotFoundTerminal'

export const metadata: Metadata = {
  title: '404',
  robots: { index: false, follow: false },
}

export default function LocaleNotFound() {
  return <NotFoundTerminal />
}
