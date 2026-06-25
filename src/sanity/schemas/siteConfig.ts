import { defineType, defineField } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Config',
  type: 'document',
  fields: [
    defineField({ name: 'careerHighlights', title: 'Career Highlights', type: 'boolean', initialValue: true }),
    defineField({ name: 'hobbies', title: 'Hobbies', type: 'boolean', initialValue: true }),
    defineField({ name: 'recommendations', title: 'Recommendations', type: 'boolean', initialValue: true }),
    defineField({ name: 'entertainment', title: 'Entertainment', type: 'boolean', initialValue: true }),
    defineField({ name: 'contact', title: 'Contact', type: 'boolean', initialValue: true }),
  ],
})
