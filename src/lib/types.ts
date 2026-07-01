export type Podcast = {
  id: number
  name: string
  description: string
  category: string
  frequency: 'always' | 'sometimes' | 'occasionally'
  link?: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

export type Recommendation = {
  id: number
  name: string
  category: string
  description: string
  link?: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

export type LookupValue = {
  id: number
  type: string
  value: string
  label: string
  color: string
  sort_order: number
}

export type Hobby = {
  id: number
  name: string
  tagline: string
  description: string
  details: string[]
  link?: string
  link_label?: string
  promo_code?: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

export type Project = {
  id: number
  name: string
  company: string
  year: string
  description: string
  tags: string[]
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

export type FunProject = Project

export type Experience = {
  id: number
  role: string
  company: string
  period: string
  year: string
  description: string
  highlights: string[]
  tags: string[]
  accent: string
  sort_order: number
  published: boolean
}

export type CareerHighlight = {
  id: number
  headline: string
  company: string
  period: string
  description: string
  accent: string
  link?: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

export type SiteSection = {
  section_key: string
  visible: boolean
  section_header: string | null
  nav_label: string | null
  sort_order: number | null
  draft_visible: boolean | null
  draft_section_header: string | null
  draft_nav_label: string | null
  draft_sort_order: number | null
}

export type NavLink = {
  id: number
  href: string
  label: string
  sort_order: number
}

export type SiteConfig = Record<string, string>

export type ChatConversation = {
  id: string
  visitor_id: string | null
  ip: string | null
  country: string | null
  city: string | null
  message_count: number
  tokens_used: number
  started_at: string
  updated_at: string
}

export type ChatMessage = {
  id: number
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// Admin list row: a conversation plus whether that IP submitted an access request
export type ChatConversationSummary = ChatConversation & {
  request_name: string | null
  request_email: string | null
}

export type LifeHack = {
  id: number
  name: string
  category: string
  description: string
  link?: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}
