export interface Hobby {
  id: string
  name: string
  tagline: string
  description: string
  details: string[]
  link?: string
  linkLabel?: string
  promoCode?: string
  status: 'active' | 'placeholder'
}

export const HOBBIES: Hobby[] = [
  {
    id: 'pickleball',
    name: 'Pickleball',
    tagline: 'Brand Ambassador · 11SIX24',
    description:
      "I got into pickleball and went deep on it — nerding out on paddles, technique, and gear. I became a brand ambassador for 11SIX24 and made it to their top-tier ambassador level.",
    details: [
      'Brand Ambassador for 11SIX24 paddles — top-tier level',
      'The sport that turned me into a paddle specs nerd',
      "Don't forget to use code ANDREW at checkout ;)",
    ],
    link: 'https://11six24.com/andrew',
    linkLabel: 'Shop 11SIX24',
    promoCode: 'ANDREW',
    status: 'active',
  },
  {
    id: 'home-repair',
    name: 'Housework & Home Repair',
    tagline: 'Before/after photos coming soon',
    description:
      "I've gotten into home improvement projects — figuring things out, making things better, and learning as I go. Before-and-after content is in the works.",
    details: [],
    status: 'placeholder',
  },
]
