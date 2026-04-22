export type SocialLink = {
  platform: string
  url: string
  username?: string
}

export type SiteSettings = {
  id: number
  full_name: string
  headline: string
  bio_short: string
  bio_long: string
  email: string
  location: string | null
  available_for_work: boolean
  availability_note: string | null
  cv_url: string | null
  image_url: string | null
  social_links: SocialLink[]
  updated_at: string
}

export type Post = {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string | null
  tags: string[]
  published_at: string | null
  created_at: string
  updated_at: string
  draft: boolean
}

export const PROJECT_STATUSES = ['aktiv', 'i-drift', 'side', 'avsluttet', 'levert', 'arkivert'] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'aktiv': 'Aktiv',
  'i-drift': 'I drift',
  'side': 'Side',
  'avsluttet': 'Avsluttet',
  'levert': 'Levert',
  'arkivert': 'Arkivert',
}

export type Project = {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string | null
  tech_stack: string[]
  live_url: string | null
  repo_url: string | null
  role: string | null
  status: ProjectStatus
  featured: boolean
  order_index: number
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
  draft: boolean
}

export type NowEntry = {
  id: string
  content: string
  published_at: string
  created_at: string
}

export type UsesItem = {
  id: string
  category: string
  name: string
  description: string | null
  url: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type RateLimit = {
  id: string
  bucket: string
  created_at: string
}

type TableDef<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type AppDatabase = {
  public: {
    Tables: {
      site_settings: TableDef<SiteSettings>
      posts: TableDef<Post>
      projects: TableDef<Project>
      now_entries: TableDef<NowEntry>
      uses_items: TableDef<UsesItem>
      rate_limits: TableDef<RateLimit>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
