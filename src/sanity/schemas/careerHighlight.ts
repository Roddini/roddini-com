import { defineType, defineField } from 'sanity'

export const careerHighlight = defineType({
  name: 'careerHighlight',
  title: 'Career Highlight',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string' }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
    defineField({ name: 'period', title: 'Period', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'accent', title: 'Accent Color (hex)', type: 'string' }),
    defineField({ name: 'link', title: 'Link URL', type: 'url' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
