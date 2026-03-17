import type { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    description: 'Business name, contact info, hours & SEO defaults — these appear across the entire website',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business Info',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'businessName', type: 'text', admin: { width: '50%', description: 'Your business name' } },
                { name: 'tagline', type: 'text', admin: { width: '50%', description: 'Tagline shown in the header' } },
              ],
            },
            { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Business logo' } },
            { name: 'responseTime', type: 'text', admin: { description: 'Average response time (e.g. "20-30 min")' } },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { width: '50%', description: 'Main phone number' } },
                { name: 'email', type: 'text', admin: { width: '50%', description: 'Contact email' } },
              ],
            },
            {
              name: 'address',
              type: 'group',
              admin: { description: 'Business address' },
              fields: [
                { name: 'street', type: 'text', admin: { description: 'Street address' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', admin: { width: '40%' } },
                    { name: 'state', type: 'text', admin: { width: '30%' } },
                    { name: 'zip', type: 'text', admin: { width: '30%' } },
                  ],
                },
              ],
            },
            {
              name: 'hours',
              type: 'array',
              admin: { description: 'Business hours — add one row per schedule', initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', type: 'text', admin: { width: '40%', description: 'e.g. Monday-Friday, Weekends' } },
                    { name: 'hours', type: 'text', admin: { width: '60%', description: 'e.g. 24/7, 8am-6pm' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO & Analytics',
          fields: [
            { name: 'defaultSeoTitle', type: 'text', admin: { description: 'Default page title for search engines' } },
            { name: 'defaultSeoDescription', type: 'textarea', admin: { description: 'Default meta description (150-160 chars ideal)' } },
            { name: 'analyticsId', type: 'text', admin: { description: 'Google Analytics tracking ID (e.g. G-XXXXXXXXXX)' } },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
