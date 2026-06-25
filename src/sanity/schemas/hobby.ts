import { defineType, defineField } from 'sanity'

export const hobby = defineType({
  name: 'hobby',
  title: 'Hobby',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'details', title: 'Details', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'link', title: 'Link URL', type: 'url' }),
    defineField({ name: 'linkLabel', title: 'Link Label', type: 'string' }),
    defineField({ name: 'promoCode', title: 'Promo Code', type: 'string' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Placeholder', value: 'placeholder' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
