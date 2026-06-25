export type RecommendationCategory = 'tech' | 'food' | 'costco' | 'entertainment' | 'general'

export interface Recommendation {
  id: string
  name: string
  category: RecommendationCategory
  description: string
  link?: string
  image?: string
}

export const RECOMMENDATION_CATEGORIES: { value: RecommendationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tech', label: 'Tech' },
  { value: 'food', label: 'Food' },
  { value: 'costco', label: 'Costco' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'general', label: 'General' },
]

export const RECOMMENDATIONS: Recommendation[] = [
  // ── Tech ──────────────────────────────────────────────────────────────────
  {
    id: 'tech-placeholder-1',
    name: 'Coming Soon',
    category: 'tech',
    description: 'Tech picks coming soon.',
  },

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    id: 'food-placeholder-1',
    name: 'Coming Soon',
    category: 'food',
    description: 'Food recommendations coming soon.',
  },

  // ── Costco ────────────────────────────────────────────────────────────────
  {
    id: 'costco-placeholder-1',
    name: 'Costco Favorites',
    category: 'costco',
    description: 'My go-to warehouse picks — list coming soon.',
  },

  // ── Entertainment ──────────────────────────────────────────────────────────
  {
    id: 'entertainment-placeholder-1',
    name: 'Coming Soon',
    category: 'entertainment',
    description: 'Entertainment recommendations coming soon.',
  },

  // ── General ───────────────────────────────────────────────────────────────
  {
    id: 'general-placeholder-1',
    name: 'Coming Soon',
    category: 'general',
    description: 'General recommendations coming soon.',
  },
]
