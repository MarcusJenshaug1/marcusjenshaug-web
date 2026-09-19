import type { ContentEntity } from '@/lib/types/app'

const API = 'https://api.openai.com/v1'

export type TranslateEntity = ContentEntity | 'site_settings'

export type TranslateOptions = {
  entity: TranslateEntity
  sourceLocale: 'nb'
  targetLocale: 'en'
}

const ENTITY_CONTEXT: Record<TranslateEntity, string> = {
  posts: 'a blog post written in MDX',
  projects: 'a portfolio project description written in MDX',
  now_entries: 'a short "now" status update written in markdown',
  uses_items: 'an item in a "uses" list of tools, hardware and software',
  site_settings: 'the site owner\'s bio, headline and contact details',
}

export const TRANSLATE_SYSTEM_PROMPT = `You translate content for the personal website of Marcus Jenshaug, a Norwegian full-stack developer at Redi AS.

Rules:
- Translate from Norwegian (bokmål) to natural, idiomatic English. Keep the author's tone: direct, concise, first person.
- Preserve MDX/markdown structure exactly: headings, lists, emphasis, tables, blockquotes, horizontal rules, JSX components and their props.
- Do not translate or alter code blocks, inline code, URLs, link targets, image paths, frontmatter keys or any HTML/JSX tag names. Link text may be translated.
- Do not translate proper nouns, product names, company names or technology names (Redi AS, Klink, Redi Hub, Supabase, Next.js, Vercel, Azure, TypeScript, etc.).
- Keep numbers, dates and units as they are.
- Do not add, remove or summarise anything. Empty input strings stay empty.
- Respond with a single JSON object with exactly the same keys as the input and string values. No prose, no code fences.`

function apiKey() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY mangler')
  return key
}

// Egen kall mot Responses API i stedet for writeText(): oversetting av lange
// MDX-tekster trenger langt flere output-tokens enn writeText sitt tak på 1500.
async function requestJson(system: string, user: string): Promise<string> {
  const res = await fetch(`${API}/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? 'gpt-5-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: { format: { type: 'json_object' } },
      max_output_tokens: 16000,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI oversetting: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)

  type Output = { type: string; content?: { type: string; text?: string }[] }
  const json = (await res.json()) as { output?: Output[] }
  const text = json.output
    ?.filter((o) => o.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text ?? '')
    .join('')
    .trim()
  if (!text) throw new Error('OpenAI oversetting: tomt svar')
  return text
}

export function parseJsonObject(raw: string): Record<string, unknown> {
  let text = raw.trim()
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fence) text = fence[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) throw new Error('Svaret inneholdt ikke JSON')
  const parsed: unknown = JSON.parse(text.slice(start, end + 1))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Svaret var ikke et JSON-objekt')
  return parsed as Record<string, unknown>
}

export async function translateFields(
  fields: Record<string, string>,
  opts: TranslateOptions
): Promise<Record<string, string>> {
  const nonEmpty = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim().length > 0))
  const out: Record<string, string> = Object.fromEntries(Object.keys(fields).map((k) => [k, '']))
  if (Object.keys(nonEmpty).length === 0) return out

  const user = [
    `Content type: ${ENTITY_CONTEXT[opts.entity]}.`,
    `Source language: ${opts.sourceLocale}. Target language: ${opts.targetLocale}.`,
    'Translate every value in this JSON object:',
    JSON.stringify(nonEmpty, null, 2),
  ].join('\n')

  const parsed = parseJsonObject(await requestJson(TRANSLATE_SYSTEM_PROMPT, user))
  for (const key of Object.keys(nonEmpty)) {
    const value = parsed[key]
    if (typeof value !== 'string') throw new Error(`Oversettelsen mangler feltet «${key}»`)
    out[key] = value
  }
  return out
}

export function suggestSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
