import type { DictionaryKey, Translator } from '@/lib/i18n'

type StackCategory = 'language' | 'framework' | 'tool' | 'infra'

type StackEntry = {
  name: string
  category: StackCategory
  note: DictionaryKey
}

export type StackItem = {
  name: string
  category: string
  note: string
}

const STACK_ENTRIES: StackEntry[] = [
  { name: 'TypeScript', category: 'language', note: 'stack.note.typescript' },
  { name: 'Next.js', category: 'framework', note: 'stack.note.nextjs' },
  { name: 'React', category: 'framework', note: 'stack.note.react' },
  { name: 'Tailwind CSS', category: 'framework', note: 'stack.note.tailwind' },
  { name: 'Supabase', category: 'infra', note: 'stack.note.supabase' },
  { name: 'PostgreSQL', category: 'infra', note: 'stack.note.postgresql' },
  { name: 'Node.js', category: 'language', note: 'stack.note.nodejs' },
  { name: 'Vercel', category: 'infra', note: 'stack.note.vercel' },
  { name: 'Azure', category: 'infra', note: 'stack.note.azure' },
  { name: 'Docker', category: 'tool', note: 'stack.note.docker' },
  { name: 'Git', category: 'tool', note: 'stack.note.git' },
  { name: 'MDX', category: 'tool', note: 'stack.note.mdx' },
]

export const STACK_NAMES = STACK_ENTRIES.map((item) => item.name)

export function getStack(t: Translator): StackItem[] {
  return STACK_ENTRIES.map((item) => ({
    name: item.name,
    category: t(`stack.category.${item.category}`),
    note: t(item.note),
  }))
}
