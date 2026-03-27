import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media File', plural: 'Media Library' },
  versions: false,
  admin: {
    group: 'Media',
    description: 'Upload and manage images, logos, certificates & documents',
    defaultColumns: ['filename', 'alt', 'mediaCategory', 'updatedAt'],
    listSearchableFields: ['alt', 'caption', 'filename'],
    components: {
      beforeListTable: ['/components/MediaCategoryTabs'],
    },
  },
  access: publicReadAdminWrite,
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1200, height: 600, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'],
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          const MAX_SIZE = 2 * 1024 * 1024 // 2MB
          if (req.file.size > MAX_SIZE) {
            throw new Error(
              `File too large: ${(req.file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed size is 2MB.`,
            )
          }
        }
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        // Auto-categorize based on which collection is uploading
        // This runs when media is uploaded via relationship fields
        if (!data?.mediaCategory || data.mediaCategory === 'uncategorized') {
          const referer = req.headers?.get?.('referer') || '';
          if (referer.includes('/gallery-items')) data.mediaCategory = 'gallery';
          else if (referer.includes('/services')) data.mediaCategory = 'services';
          else if (referer.includes('/service-categories')) data.mediaCategory = 'services';
          else if (referer.includes('/team-members')) data.mediaCategory = 'team';
          else if (referer.includes('/vehicle-makes')) data.mediaCategory = 'vehicles';
          else if (referer.includes('/quote-requests')) data.mediaCategory = 'quotes';
          else if (referer.includes('/hero-settings')) data.mediaCategory = 'hero';
          else if (referer.includes('/site-settings')) data.mediaCategory = 'branding';
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Describe the image for accessibility (e.g. "Front door deadbolt installation")' } },
    { name: 'caption', type: 'text', admin: { description: 'Optional caption shown below the image' } },
    {
      name: 'mediaCategory',
      type: 'select',
      defaultValue: 'uncategorized',
      admin: {
        description: 'Which section this media belongs to (auto-detected on upload)',
        position: 'sidebar',
      },
      options: [
        { label: 'All / Uncategorized', value: 'uncategorized' },
        { label: 'Gallery (Before/After)', value: 'gallery' },
        { label: 'Services', value: 'services' },
        { label: 'Team Members', value: 'team' },
        { label: 'Hero / Banners', value: 'hero' },
        { label: 'Branding / Logos', value: 'branding' },
        { label: 'Vehicles', value: 'vehicles' },
        { label: 'Quote Requests', value: 'quotes' },
      ],
    },
  ],
}

export default Media
