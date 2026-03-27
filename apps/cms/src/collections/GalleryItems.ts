import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: { singular: 'Gallery Item', plural: 'Before/After Gallery' },
  versions: false,
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    description: 'Before & after project photos. Each item has its own unique before/after images.',
    defaultColumns: ['title', 'category', 'subcategory', 'isActive', 'sortOrder'],
    listSearchableFields: ['title', 'category', 'subcategory'],
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Auto-generate title from category + subcategory if not manually set
        if (data?.category && data?.subcategory && !originalDoc?.title) {
          data.title = `${data.category} — ${data.subcategory}`;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Display title (e.g. "Deadbolt Replacement")' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          admin: { width: '50%', description: 'Main service category' },
          options: [
            { label: 'Residential', value: 'Residential' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Automotive', value: 'Automotive' },
          ],
        },
        {
          name: 'subcategory',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Service name (e.g. "Deadbolt Replacement", "Smart Lock Installation")',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'beforeImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '50%',
            description: '📷 BEFORE photo — upload a unique image for this item',
          },
        },
        {
          name: 'afterImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '50%',
            description: '📷 AFTER photo — upload a unique image for this item',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of the work done' },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: { description: 'Link to the related service (optional)' },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Show on Website', admin: { position: 'sidebar', description: 'Uncheck to hide from gallery' } },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar', description: 'Display order (lower = first)' } },
  ],
}

export default GalleryItems
