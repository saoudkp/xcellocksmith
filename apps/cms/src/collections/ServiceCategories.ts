import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'
import { autoGenerateSlug } from '@/hooks/autoGenerateSlug'
import { regenerateSitemap } from '@/hooks/regenerateSitemap'

const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  labels: { singular: 'Service Category', plural: 'Service Categories' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    description: 'Residential, Commercial & Automotive — the 3 main service groups',
    defaultColumns: ['name', 'slug', 'isActive', 'sortOrder'],
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeValidate: [autoGenerateSlug],
    afterChange: [regenerateSitemap],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%', description: 'Category name shown on the website' } },
        { name: 'slug', type: 'text', unique: true, required: true, admin: { width: '50%', description: 'Auto-generated from name — used in URLs' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', admin: { width: '50%', description: 'Short label for navigation tabs' } },
        { name: 'color', type: 'text', admin: { width: '50%', description: 'Accent color (e.g. #3B82F6)' } },
      ],
    },
    { name: 'headline', type: 'text', admin: { description: 'Category page headline' } },
    { name: 'description', type: 'textarea', admin: { description: 'Brief description shown under the category heading' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: 'Banner image for this category' } },
    {
      type: 'collapsible',
      label: 'SEO Settings',
      admin: { initCollapsed: true },
      fields: [
        { name: 'seoTitle', type: 'text', admin: { description: 'Custom page title for search engines' } },
        { name: 'seoDescription', type: 'textarea', admin: { description: 'Meta description for search results' } },
      ],
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar', description: 'Show on website' } },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar', description: 'Display order (lower = first)' } },
  ],
}

export default ServiceCategories
