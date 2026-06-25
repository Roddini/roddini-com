export type SanityHobby = {
  _id: string
  name: string
  tagline: string
  description: string
  details: string[]
  link?: string
  linkLabel?: string
  promoCode?: string
  status: 'active' | 'placeholder'
}

export type SanityRecommendation = {
  _id: string
  name: string
  category: 'tech' | 'food' | 'costco' | 'entertainment' | 'general'
  description: string
  link?: string
}

export type SanityPodcast = {
  _id: string
  name: string
  description: string
  category: string
  frequency: 'always' | 'sometimes' | 'occasionally'
  link?: string
}

export type SanityCareerHighlight = {
  _id: string
  headline: string
  company: string
  period: string
  description: string
  accent: string
  link?: string
}

export type SanityConfig = {
  careerHighlights: boolean
  hobbies: boolean
  recommendations: boolean
  entertainment: boolean
  contact: boolean
}
