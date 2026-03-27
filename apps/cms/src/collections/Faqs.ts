import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  versions: false,
  admin: {
    group: 'Content',
    useAsTitle: 'question',
    description: 'Frequently asked questions — shown on the homepage FAQ section',
    defaultColumns: ['question', 'category', 'isActive', 'sortOrder'],
  },
  access: publicReadAdminWrite,
  fields: [
    { name: 'question', type: 'text', required: true, admin: { description: 'The question customers ask' } },
    { name: 'answer', type: 'richText', required: true, admin: { description: 'Your answer — keep it clear and helpful' } },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Services', value: 'services' },
        { label: 'Emergency', value: 'emergency' },
      ],
      admin: { description: 'Group this FAQ under a topic' },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Show on Website', admin: { position: 'sidebar', description: 'Uncheck to hide from website' } },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar', description: 'Display order (lower = first)' } },
  ],
}

export default Faqs
