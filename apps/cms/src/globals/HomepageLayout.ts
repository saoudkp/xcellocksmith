import type { GlobalConfig } from 'payload'

const HomepageLayout: GlobalConfig = {
  slug: 'homepage-layout',
  label: 'Homepage Layout',
  admin: {
    description: 'Drag and reorder the sections on your homepage. Toggle sections on/off, edit headings & subheadings.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-assign sortOrder based on array position after drag-reorder
        if (data?.sections && Array.isArray(data.sections)) {
          data.sections.forEach((section: Record<string, unknown>, index: number) => {
            section.sortOrder = index;
          });
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'sections',
      type: 'array',
      admin: {
        description: '↕️ Drag rows to reorder sections on the homepage',
        initCollapsed: false,
        components: {
          RowLabel: '/components/SectionRowLabel',
        },
      },
      fields: [
        {
          name: 'sectionType',
          type: 'select',
          required: true,
          options: [
            { label: 'Hero Banner', value: 'hero' },
            { label: 'Services', value: 'services' },
            { label: 'Reviews', value: 'reviews' },
            { label: 'Before/After Gallery', value: 'gallery' },
            { label: 'Get a Quote', value: 'quote' },
            { label: 'Vehicle Checker', value: 'vehicle-verifier' },
            { label: 'Our Team', value: 'team' },
            { label: 'Service Area Map', value: 'map' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Contact', value: 'contact' },
            { label: 'Visitor Counter', value: 'visitor-counter' },
          ],
          admin: { description: 'Which section to display' },
        },
        {
          type: 'row',
          fields: [
            { name: 'heading', type: 'text', admin: { width: '50%', description: 'Section heading (optional override)' } },
            { name: 'subheading', type: 'text', admin: { width: '50%', description: 'Section subheading (optional override)' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: '✅ Show this section' } },
            { name: 'sortOrder', type: 'number', admin: { width: '50%', description: 'Auto-updated on save (drag to reorder)', readOnly: true } },
          ],
        },
      ],
    },
  ],
}

export default HomepageLayout
