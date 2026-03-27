import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'
import { autoGenerateSeo } from '@/hooks/autoGenerateSeo'
import { revalidateCityPages } from '@/hooks/revalidateCityPages'
import { regenerateSitemap } from '@/hooks/regenerateSitemap'

const ServiceAreas: CollectionConfig = {
  slug: 'service-areas',
  versions: false,
  admin: {
    group: 'Content',
    useAsTitle: 'cityName',
    defaultColumns: ['cityName', 'state', 'isActive', 'sortOrder'],
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeValidate: [autoGenerateSeo],
    afterChange: [revalidateCityPages, regenerateSitemap],
  },
  fields: [
    { name: 'cityName', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, required: true },
    { name: 'state', type: 'text', defaultValue: 'OH' },
    { name: 'lat', type: 'number', required: true },
    { name: 'lng', type: 'number', required: true },
    { name: 'radiusMiles', type: 'number', defaultValue: 5 },
    { name: 'responseTime', type: 'text', defaultValue: '20-30 min' },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
    {
      name: 'seoPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/SEOPreview',
        },
      },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Show on Website', admin: { position: 'sidebar', description: 'Uncheck to hide from website' } },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar', description: 'Display order (lower = first)' } },
  ],
}

export default ServiceAreas
