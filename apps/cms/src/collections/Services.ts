import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'
import { autoGenerateSlug } from '@/hooks/autoGenerateSlug'
import { autoGenerateSeo } from '@/hooks/autoGenerateSeo'
import { revalidateServicePages } from '@/hooks/revalidateServicePages'
import { regenerateSitemap } from '@/hooks/regenerateSitemap'

const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    description: 'All 29 locksmith services — edit pricing, descriptions, images & more',
    defaultColumns: ['title', 'category', 'icon', 'isActive'],
    listSearchableFields: ['title', 'slug', 'shortDescription'],
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeValidate: [autoGenerateSlug, autoGenerateSeo],
    afterChange: [revalidateServicePages, regenerateSitemap],
  },
  fields: [
    // ── Main Info ──
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Info',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '60%', description: 'Service name shown on the website' } },
                { name: 'slug', type: 'text', unique: true, required: true, admin: { width: '40%', description: 'Auto-generated — used in URLs' } },
              ],
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'service-categories',
              required: true,
              admin: { description: 'Which category does this service belong to?' },
            },
            { name: 'shortDescription', type: 'textarea', admin: { description: 'One-liner shown on the service card (keep it under 120 characters)' } },
            {
              type: 'row',
              fields: [
                { name: 'icon', type: 'text', admin: { width: '50%', description: 'Pick an icon', components: { Field: '/components/IconPickerField' } } },
                { name: 'ctaText', type: 'text', admin: { width: '50%', description: 'Call-to-action button text' } },
              ],
            },
          ],
        },
        {
          label: 'Detailed Content',
          fields: [
            { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: 'Main image shown when a customer clicks on this service' } },
            { name: 'longDescription', type: 'richText', admin: { description: 'Full description — shown in the service detail popup' } },
            {
              name: 'benefits',
              type: 'array',
              admin: { description: 'Key selling points — shown as a checklist', initCollapsed: false },
              fields: [{ name: 'benefit', type: 'text', required: true, admin: { description: 'e.g. "No damage to locks or doors"' } }],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text', admin: { description: 'Custom page title for search engines' } },
            { name: 'seoDescription', type: 'textarea', admin: { description: 'Meta description for search results (150-160 chars ideal)' } },
            {
              name: 'seoPreview',
              type: 'ui',
              admin: { components: { Field: '/components/SEOPreview' } },
            },
          ],
        },
      ],
    },
    // ── Sidebar ──
    { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Show on website' } },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar', description: 'Display order (lower = first)' } },
  ],
}

export default Services
