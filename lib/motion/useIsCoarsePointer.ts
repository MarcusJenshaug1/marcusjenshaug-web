'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(pointer: coarse)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

export function useIsCoarsePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  )
}
