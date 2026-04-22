import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') ?? 'Marcus Jenshaug').slice(0, 120)
  const type = (searchParams.get('type') ?? '').slice(0, 30)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#fbfaf7',
          color: '#17140f',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '22px', fontWeight: 600 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'oklch(0.62 0.18 38)' }} />
          <span>marcus<span style={{ color: '#9a9284' }}>.</span>no</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {type && (
            <div
              style={{
                fontSize: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: '#6b6356',
                fontFamily: 'monospace',
              }}
            >
              {type}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? '56px' : '72px',
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#17140f',
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '20px', color: '#6b6356', fontFamily: 'monospace' }}>
          <span>marcusjenshaug.no</span>
          <span>nb-NO</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
