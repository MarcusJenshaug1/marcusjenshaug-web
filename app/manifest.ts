import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marcus Jenshaug',
    short_name: 'Marcus',
    description: 'Personlig nettside og entity home for Marcus Jenshaug.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfaf7',
    theme_color: '#17140f',
    lang: 'nb-NO',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
