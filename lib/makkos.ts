import type { SiteSettings } from '@/lib/types/app'

export function getSpotifyUrl(settings: SiteSettings): string | null {
  return (
    settings.social_links.find((l) => l.platform.toLowerCase() === 'spotify')?.url ?? null
  )
}

export function spotifyUrlToUri(url: string): string | null {
  const match = url.match(
    /open\.spotify\.com\/(intl-[a-z]+\/)?(artist|album|track|playlist|episode|show)\/([a-zA-Z0-9]+)/
  )
  if (!match) return null
  return `spotify:${match[2]}:${match[3]}`
}
