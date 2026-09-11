const API = 'https://api.openai.com/v1'

function apiKey() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY mangler')
  return key
}

export async function writeText(system: string, user: string): Promise<string> {
  const res = await fetch(`${API}/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? 'gpt-5-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_output_tokens: 1500,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI tekst: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)

  type Output = { type: string; content?: { type: string; text?: string }[] }
  const json = (await res.json()) as { output?: Output[] }
  const text = json.output
    ?.filter((o) => o.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text ?? '')
    .join('')
    .trim()
  if (!text) throw new Error('OpenAI tekst: tomt svar')
  return text
}

export type GeneratedImage = { bytes: Buffer; contentType: 'image/webp' }

export async function generateImage(prompt: string): Promise<GeneratedImage> {
  const res = await fetch(`${API}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2',
      prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
      output_format: 'webp',
      output_compression: 85,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI bilde: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)

  const json = (await res.json()) as { data?: { b64_json?: string }[] }
  const b64 = json.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI bilde: tomt svar')
  return { bytes: Buffer.from(b64, 'base64'), contentType: 'image/webp' }
}
