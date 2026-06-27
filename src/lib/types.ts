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
