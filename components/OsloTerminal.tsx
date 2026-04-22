'use client'

import { useEffect, useState } from 'react'

function formatOslo(d: Date) {
  return d.toLocaleString('nb-NO', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  })
}

export function OsloTerminal() {
  const [value, setValue] = useState(() => formatOslo(new Date()))

  useEffect(() => {
    const t = setInterval(() => setValue(formatOslo(new Date())), 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="term" style={{ marginTop: '1rem', fontSize: '.75rem' }}>
      <div><span className="com"># lokal tid i Oslo</span></div>
      <div>
        <span className="prompt">marcus@redi</span>{' '}
        <span className="str">~/jenshaug</span>{' '}
        $ date +&quot;%A %H:%M&quot;
      </div>
      <div style={{ color: '#d4cfc1' }}>{value}</div>
    </div>
  )
}
