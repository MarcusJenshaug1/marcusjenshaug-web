// Em-dash (U+2014) → komma. Brukes til å rydde opp i AI-generert tekst før lagring.
// Vanlig bindestrek (-, U+002D) og en-dash (–, U+2013) røres ikke.
const EM_DASH = /\u2014/g

export function cleanEmDashes<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(EM_DASH, ',') as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => cleanEmDashes(v)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = cleanEmDashes(v)
    }
    return out as T
  }
  return value
}
