import type { GlobalConfig } from 'payload'

const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    description: 'Menu links shown in the website header — drag to reorder, toggle to show/hide',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.items && Array.isArray(data.items)) {
          data.items.forEach((item: Record<string, unknown>, index: number) => {
            item.sortOrder = index;
          });
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        description: '↕️ Drag rows to reorder menu items',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '35%', description: 'Menu text (e.g. Services)' } },
            { name: 'href', type: 'text', required: true, admin: { width: '35%', description: 'Link target (e.g. #services)' } },
            { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { width: '15%', description: 'Visible' } },
            { name: 'sortOrder', type: 'number', admin: { width: '15%', description: 'Auto-updated on save', readOnly: true } },
          ],
        },
      ],
    },
  ],
}

export default Navigation
