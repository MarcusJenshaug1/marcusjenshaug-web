import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxOptions } from '@/lib/mdx'

type Props = {
  source: string
}

export async function SafeMdx({ source }: Props) {
  try {
    const { content } = await compileMDX({
      source,
      options: mdxOptions,
    })
    return <>{content}</>
  } catch (error) {
    console.error('MDX-rendering feilet:', error)
    return (
      <div>
        <div
          style={{
            padding: '.5rem .75rem',
            marginBottom: '1rem',
            background: 'var(--bg-sunken)',
            borderRadius: '6px',
            fontSize: '.8125rem',
            color: 'var(--ink-3)',
            fontFamily: 'var(--ff-mono)',
          }}
        >
          MDX-parseren feilet. Viser rå tekst.
        </div>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{source}</div>
      </div>
    )
  }
}
