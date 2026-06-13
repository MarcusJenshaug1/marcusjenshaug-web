'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}
