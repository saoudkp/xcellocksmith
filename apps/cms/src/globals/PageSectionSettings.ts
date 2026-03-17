import type { GlobalConfig, Field } from 'payload'
import { invalidateSectionsCache, invalidateServicesCache } from '../hooks/sectionEditorHooks'

/**
 * Page Section Settings — unified dropdown-based section editor.
 *
 * UX layout per section:
 *   "Page Section Settings — {Section Name}" title banner
 *   Heading → WYSIWYG editor (pre-filled with current heading)
 *   Subheading → WYSIWYG editor (pre-filled with current subheading)
 *
 * No redundant plain text fields visible — hidden fields store fallback text.
 * Content auto-publishes on save.
 */

/** Standard heading + subheading fields (WYSIWYG only, text fields hidden). */
function sectionFields(
  defaultHeading: string,
  defaultSubheading: string,
  extra?: Field[],
): Field[] {
  return [
    // Title banner — reads section from form state
    {
      name: '_titleBanner',
      type: 'ui',
      admin: { components: { Field: '/components/SectionTitleBanner' } },
    },
    // Hidden plain text for frontend fallback
    { name: 'heading', type: 'text', defaultValue: defaultHeading, admin: { condition: () => false } },
    // Heading WYSIWYG
    {
      name: 'richHeading',
      type: 'text',
      label: 'Heading',
      admin: {
        description: 'Edit the section heading with formatting, colors, and fonts.',
        components: { Field: '/components/WysiwygField' },
      },
    },
    // Hidden plain text for frontend fallback
    { name: 'subheading', type: 'text', defaultValue: defaultSubheading, admin: { condition: () => false } },
    // Subheading WYSIWYG
    {
      name: 'richSubheading',
      type: 'text',
      label: 'Subheading',
      admin: {
        description: 'Edit the section subheading with formatting, colors, and fonts.',
        components: { Field: '/components/WysiwygField' },
      },
    },
    // Legacy DB columns — hidden
    { name: 'draftData', type: 'json', admin: { condition: () => false } },
    { name: 'publishedData', type: 'json', admin: { condition: () => false } },
    {
      name: 'status', type: 'select', defaultValue: 'published',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
      admin: { condition: () => false },
    },
    ...(extra || []),
  ]
}

const PageSectionSettings: GlobalConfig = {
  slug: 'sections-settings',
  label: 'Page Section Settings',
  access: { read: () => true, update: () => true },
  hooks: {
    afterChange: [invalidateSectionsCache, invalidateServicesCache],
  },
  fields: [
    // ── Section selector dropdown ──
    {
      name: '_sectionSelector',
      type: 'text',
      admin: {
        components: { Field: '/components/SectionSelectorField' },
      },
    },

    // ── Services ──
    {
      type: 'group', name: 'services', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'services' },
      fields: [
        {
          name: '_titleBanner', type: 'ui',
          admin: { components: { Field: '/components/SectionTitleBanner' } },
        },
        { name: 'heading', type: 'text', defaultValue: 'Complete Locksmith Services', admin: { condition: () => false } },
        {
          name: 'richHeading', type: 'text', label: 'Heading',
          admin: { description: 'Edit the services heading.', components: { Field: '/components/WysiwygField' } },
        },
        { name: 'headingAccent', type: 'text', defaultValue: 'Services', admin: { condition: () => false } },
        {
          name: 'richAccent', type: 'text', label: 'Accented Word',
          admin: { description: 'Format the accented word in the heading.', components: { Field: '/components/WysiwygField' } },
        },
        { name: 'description', type: 'textarea', defaultValue: '29 professional locksmith services across residential, commercial & automotive — all backed by transparent pricing and our no-hidden-fees guarantee.', admin: { condition: () => false } },
        {
          name: 'richDescription', type: 'text', label: 'Description',
          admin: { description: 'Edit the services description.', components: { Field: '/components/WysiwygField' } },
        },
      ],
    },
    {
      type: 'group', name: 'residential', label: 'Residential Category',
      admin: { condition: (data) => data?._sectionSelector === 'services' },
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Residential', label: 'Category Label' },
        { name: 'description', type: 'text', defaultValue: 'Home lockouts, lock installation, rekeying, smart locks & more', label: 'Category Description' },
        { name: 'color', type: 'text', defaultValue: '#22c55e', label: 'Accent Color', admin: { components: { Field: '/components/ColorPickerField' } } },
        { name: 'icon', type: 'text', defaultValue: 'Home', label: 'Category Icon', admin: { components: { Field: '/components/IconPickerField' } } },
      ],
    },
    {
      type: 'group', name: 'commercial', label: 'Commercial Category',
      admin: { condition: (data) => data?._sectionSelector === 'services' },
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Commercial', label: 'Category Label' },
        { name: 'description', type: 'text', defaultValue: 'Business security, access control, master key systems & more', label: 'Category Description' },
        { name: 'color', type: 'text', defaultValue: '#3b82f6', label: 'Accent Color', admin: { components: { Field: '/components/ColorPickerField' } } },
        { name: 'icon', type: 'text', defaultValue: 'Building2', label: 'Category Icon', admin: { components: { Field: '/components/IconPickerField' } } },
      ],
    },
    {
      type: 'group', name: 'automotive', label: 'Automotive Category',
      admin: { condition: (data) => data?._sectionSelector === 'services' },
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Automotive', label: 'Category Label' },
        { name: 'description', type: 'text', defaultValue: 'Car lockouts, key programming, ignition repair & more', label: 'Category Description' },
        { name: 'color', type: 'text', defaultValue: '#ef4444', label: 'Accent Color', admin: { components: { Field: '/components/ColorPickerField' } } },
        { name: 'icon', type: 'text', defaultValue: 'Car', label: 'Category Icon', admin: { components: { Field: '/components/IconPickerField' } } },
      ],
    },

    // ── Reviews ──
    {
      type: 'group', name: 'reviews', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'reviews' },
      fields: sectionFields('What Our Customers Say', 'Real reviews from real Cleveland area customers'),
    },

    // ── Gallery ──
    {
      type: 'group', name: 'gallery', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'gallery' },
      fields: sectionFields('Before & After Gallery', 'Browse our work across residential, automotive & commercial locksmithing. Click a category to see all projects.'),
    },

    // ── Free Quote ──
    {
      type: 'group', name: 'quote', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'quote' },
      fields: sectionFields('Get a Free Quote in Seconds', "Tell us what you need and we'll give you an upfront price — no surprises, no hidden fees."),
    },

    // ── Vehicle Check ──
    {
      type: 'group', name: 'vehicleVerifier', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'vehicleVerifier' },
      fields: sectionFields('Vehicle Compatibility Check', 'Select your vehicle make and model to verify which automotive locksmith services we support.'),
    },

    // ── Our Team ──
    {
      type: 'group', name: 'team', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'team' },
      fields: sectionFields('Meet Our Expert Team', 'Licensed, certified, and background-checked professionals with decades of combined locksmith experience serving Cleveland and surrounding communities.'),
    },

    // ── Service Area ──
    {
      type: 'group', name: 'serviceArea', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'serviceArea' },
      fields: sectionFields('Our Service Area', 'Serving Cleveland and 24 surrounding communities with fast 20–30 minute response times.'),
    },

    // ── FAQ ──
    {
      type: 'group', name: 'faq', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'faq' },
      fields: sectionFields('Frequently Asked Questions', "Get answers to the most common locksmith questions. Still have questions? Call us 24/7."),
    },

    // ── Contact Us ──
    {
      type: 'group', name: 'contact', label: ' ',
      admin: { condition: (data) => data?._sectionSelector === 'contact' },
      fields: sectionFields('Get in Touch', "Reach us anytime — we're always just a call, text, or message away.", [
        {
          name: 'socialLinks', type: 'array', label: 'Social Media Links',
          admin: { description: 'Add, remove, or reorder social media links' },
          fields: [
            { name: 'platform', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            { name: 'icon', type: 'text', defaultValue: 'Globe', label: 'Icon', admin: { components: { Field: '/components/IconPickerField' } } },
            { name: 'color', type: 'text', defaultValue: '#3b82f6', label: 'Icon Color', admin: { components: { Field: '/components/ColorPickerField' } } },
          ],
        },
      ]),
    },
  ],
}

export default PageSectionSettings
