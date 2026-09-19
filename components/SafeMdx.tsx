import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxOptions } from '@/lib/mdx'
import { makeTranslator } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  source: string
  locale?: Locale
}

export async function SafeMdx({ source, locale = 'nb' }: Props) {
  try {
    const { content } = await compileMDX({
      source,
      options: mdxOptions,
    })
    return <>{content}</>
  } catch (error) {
    console.error('MDX-rendering feilet:', error)
    const t = makeTranslator(locale)
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
          {t('mdx.failed')}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{source}</div>
      </div>
    )
  }
}
