import type { GlobalConfig, Field } from 'payload'

const colorOptions = [
  { label: 'White', value: '#ffffff' },
  { label: 'Accent Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Yellow', value: '#facc15' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Gray', value: '#9ca3af' },
  { label: 'Light Gray', value: '#d1d5db' },
]

const fontOptions = [
  { label: 'Display (Headings)', value: 'font-display' },
  { label: 'Sans (Body)', value: 'font-sans' },
  { label: 'Mono (Code)', value: 'font-mono' },
]

function styledTextField(name: string, label: string, defaultText: string, defaultColor = '#ffffff', defaultFont = 'font-display'): Field {
  return {
    name, label, type: 'group',
    fields: [
      { name: 'text', type: 'text', required: true, defaultValue: defaultText },
      {
        name: 'color', type: 'text', defaultValue: defaultColor,
        admin: {
          components: { Field: '/components/ColorPickerField' },
        },
      },
      { name: 'font', type: 'select', defaultValue: defaultFont, options: fontOptions },
    ],
  }
}

function iconField(name: string, defaultValue = 'Star', description = 'Pick an icon'): Field {
  return {
    name, type: 'text', defaultValue,
    admin: {
      description,
      components: { Field: '/components/IconPickerField' },
    },
  }
}

const HeroSettings: GlobalConfig = {
  slug: 'hero-settings',
  label: 'Hero Section',
  versions: false,
  access: { read: () => true },
  admin: { group: 'Layout' },
  fields: [
    styledTextField('headlineLine1', 'Headline Line 1', "Cleveland's Fastest"),
    styledTextField('headlineAccent', 'Headline Accent', '24/7 Emergency', '#3b82f6'),
    styledTextField('headlineLine2', 'Headline Line 2', 'Locksmith'),
    styledTextField('subtitle', 'Subtitle', 'Locked out? We handle residential, commercial & automotive emergencies.', '#ffffff', 'font-sans'),
    styledTextField('subtitleBold', 'Subtitle Bold Part', '20-30 min arrival.'),
    { name: 'ctaPrimaryText', type: 'text', defaultValue: 'Call Now', label: 'Primary CTA Text' },
    { name: 'ctaSecondaryText', type: 'text', defaultValue: 'Get a Free Quote', label: 'Secondary CTA Text' },
    {
      name: 'ctaPrimaryColor', type: 'text', defaultValue: '#ef4444', label: 'Primary CTA Color',
      admin: { components: { Field: '/components/ColorPickerField' } },
    },
    {
      name: 'badges', type: 'array', label: 'Hero Badges', minRows: 1, maxRows: 6,
      fields: [
        { name: 'text', type: 'text', required: true },
        iconField('icon', 'Star', 'Badge icon'),
      ],
    },
    styledTextField('responseLabel', 'Response Label', 'Guaranteed response'),
    {
      name: 'categoryLinks', type: 'array', label: 'Category Quick Links', minRows: 1, maxRows: 6,
      fields: [
        { name: 'label', type: 'text', required: true },
        iconField('icon', 'Key', 'Category icon'),
        {
          name: 'color', type: 'text', defaultValue: '#3b82f6', label: 'Icon Color',
          admin: { components: { Field: '/components/ColorPickerField' } },
        },
        { name: 'href', type: 'text', admin: { description: 'Link target (e.g. #residential)' } },
      ],
    },
  ],
}

export default HeroSettings
