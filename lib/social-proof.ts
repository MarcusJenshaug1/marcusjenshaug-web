export type Stat = {
  label: string
  value: 'derived:projects' | 'derived:in-production' | 'derived:posts' | 'derived:uses' | number
  suffix?: string
}

export const STATS: Stat[] = [
  { label: 'Prosjekter i porteføljen', value: 'derived:projects' },
  { label: 'Produkter i drift', value: 'derived:in-production' },
  { label: 'Publiserte notater', value: 'derived:posts' },
  { label: 'Verktøy i daglig bruk', value: 'derived:uses' },
]

export type Quote = {
  quote: string
  name: string
  role: string
}

// Sitater/anbefalinger. Fyll inn ekte sitater her — seksjonen rendres
// først når listen har innhold.
export const QUOTES: Quote[] = []
