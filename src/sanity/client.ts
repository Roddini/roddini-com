import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'qd5frda4',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
