export const COVER_STYLE =
  'Cinematic 3D render, photorealistic product-photography look. Ultra-wide landscape banner, hero object centered with generous empty space above and below (the image will be cropped to a wide strip). Near-black warm charcoal background with a subtle vignette. One matte, dark hero object. Lighting: a single warm amber-orange key light appearing as thin glowing lines, edges or ribbons, plus a faint cool teal rim light from the opposite side. Materials: matte dark plastic, dark cardboard, black frosted glass, soft-touch surfaces; no chrome, no mirror reflections. Light volumetric haze, shallow depth of field, soft shadows. Minimal, calm, premium. Absolutely no text, letters, numbers, logos, people, faces or UI screenshots. Not illustration, not cartoon, not neon cyberpunk.'

const SUBJECT_EXAMPLES = [
  {
    title: 'Klink',
    description: 'Drikkespill-app med kortstokk og utfordringer for vorspiel.',
    subject:
      'a neat deck of matte black playing cards on a matte black table, with the top card lifted and tilted mid-flip, its edge glowing amber-orange. Two dark frosted shot glasses stand just behind the deck, rims touching as if about to clink. Faint teal rim light from behind. Playful but restrained, late-evening atmosphere.',
  },
  {
    title: 'Flowment',
    description: 'Logistikk- og fakturaflyt for transportselskaper.',
    subject:
      'a row of dark cardboard parcels and one wooden pallet on a matte black conveyor, seen from a low three-quarter angle. From each parcel a thin amber-orange light thread runs to the right and lands as a glowing line on a tall sheet of dark frosted glass shaped like an invoice with blank rows. One of the threads is slightly brighter and ends in a small glowing ring, as if a single line has been flagged. A faint teal glow behind the glass sheet. Everything else is dark and still.',
  },
  {
    title: 'Spiderweb AS',
    description: 'Lite webbyrå som bygger nettsider for håndverk og småbedrifter.',
    subject:
      'a delicate, geometrically perfect spider web made of hair-thin amber-orange light threads, strung between two matte black vertical pillars. A few tiny dew drops sit on the threads and catch a faint teal glint. Below the web, a closed matte black laptop and a dark ceramic coffee cup rest on a black surface, slightly out of focus. Craftsmanship, patience, small-studio atmosphere.',
  },
]

export const SUBJECT_SYSTEM_PROMPT = [
  'You write the "Subject:" paragraph for a cover image of a software project on a Norwegian developer portfolio.',
  'The paragraph is appended to a fixed style block, so it must only describe the scene: one matte dark hero object or a small cluster of objects on a matte black surface, physical and tangible, that works as a visual metaphor for what the project does. Use thin amber-orange light lines, edges or threads as the single warm accent and a faint teal rim light as the single cool accent.',
  'Rules: 60 to 110 words, English, one paragraph, present tense, concrete materials and camera angle. Never mention text, letters, numbers, logos, screens, UI, people, faces or brand names. Never describe a computer screen as the hero object. Do not repeat the style block. Output the paragraph only, without the "Subject:" prefix.',
  '',
  'Examples of the expected tone:',
  ...SUBJECT_EXAMPLES.map((e) => `Project: ${e.title} — ${e.description}\nSubject: ${e.subject}`),
].join('\n')

type SubjectInput = {
  title: string
  description: string
  content: string
  hint?: string
}

export function buildSubjectRequest({ title, description, content, hint }: SubjectInput): string {
  const excerpt = content.replace(/\s+/g, ' ').trim().slice(0, 2500)
  return [
    `Project: ${title}`,
    `Short description: ${description}`,
    `Content excerpt: ${excerpt || '(none)'}`,
    hint?.trim() ? `Direction from the author (must be followed): ${hint.trim()}` : '',
    '',
    'Write the Subject paragraph.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function composeCoverPrompt(subject: string): string {
  return `${COVER_STYLE}\n\nSubject: ${subject.replace(/^Subject:\s*/i, '').trim()}`
}
