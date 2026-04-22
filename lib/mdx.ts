import rehypePrettyCode, { type Options } from 'rehype-pretty-code'

const prettyCodeOptions: Partial<Options> = {
  theme: 'github-light-default',
  keepBackground: false,
}

export const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]] as never,
  },
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
