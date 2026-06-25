import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { siteConfig } from './src/sanity/schemas/siteConfig'
import { hobby } from './src/sanity/schemas/hobby'
import { recommendation } from './src/sanity/schemas/recommendation'
import { podcast } from './src/sanity/schemas/podcast'
import { careerHighlight } from './src/sanity/schemas/careerHighlight'

export default defineConfig({
  name: 'portfolio',
  title: 'Andrew Roddini — Portfolio',
  projectId: 'qd5frda4',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: [siteConfig, hobby, recommendation, podcast, careerHighlight],
  },
})
