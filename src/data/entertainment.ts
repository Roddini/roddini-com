export type PodcastFrequency = 'always' | 'sometimes' | 'occasionally'

export interface Podcast {
  id: string
  name: string
  description: string
  category: string
  frequency: PodcastFrequency
  link?: string
}

export const FREQUENCY_LABELS: Record<PodcastFrequency, string> = {
  always: 'Always On',
  sometimes: 'Sometimes',
  occasionally: 'Occasionally',
}

export const ENTERTAINMENT = {
  podcasts: [
    {
      id: 'podcast-placeholder-1',
      name: 'Coming Soon',
      description: 'I listen to a lot of podcasts. Full list coming soon — broken into categories.',
      category: 'General',
      frequency: 'always' as PodcastFrequency,
    },
    {
      id: 'podcast-placeholder-2',
      name: 'Business & Tech',
      description: 'Placeholder for business and tech podcasts.',
      category: 'Business',
      frequency: 'sometimes' as PodcastFrequency,
    },
    {
      id: 'podcast-placeholder-3',
      name: 'Sports & Culture',
      description: 'Placeholder for sports and culture podcasts.',
      category: 'Sports',
      frequency: 'occasionally' as PodcastFrequency,
    },
  ] as Podcast[],
}
