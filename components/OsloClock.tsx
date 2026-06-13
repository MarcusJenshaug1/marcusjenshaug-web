'use client'

import { useEffect, useState } from 'react'

function osloTime(d: Date) {
  return d.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  })
}

export function OsloClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(osloTime(new Date()))
    const t = setInterval(() => setTime(osloTime(new Date())), 30000)
    return () => clearInterval(t)
  }, [])

  return <>{time}</>
}
