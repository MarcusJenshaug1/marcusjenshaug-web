export const CACHE_REVALIDATE_SECONDS = 3600

export const TAGS = {
  posts: 'posts',
  projects: 'projects',
  now: 'now',
  uses: 'uses',
  settings: 'settings',
  ui: 'ui',
  translations: 'translations',
} as const

export function postTag(slug: string) {
  return `post:${slug}`
}

export function projectTag(slug: string) {
  return `project:${slug}`
}
