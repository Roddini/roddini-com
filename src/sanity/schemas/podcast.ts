import { defineType, defineField } from 'sanity'

export const podcast = defineType({
  name: 'podcast',
  title: 'Podcast',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'category', title: 'Category', type: 'string' }),
    defineField({
      name: 'frequency',
      title: 'Frequency',
      type: 'string',
      options: {
        list: [
          { title: 'Always On', value: 'always' },
          { title: 'Sometimes', value: 'sometimes' },
          { title: 'Occasionally', value: 'occasionally' },
        ],
      },
    }),
    defineField({ name: 'link', title: 'Link URL', type: 'url' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
