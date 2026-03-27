import type { GlobalConfig } from 'payload'

/**
 * Default Settings — provides "Restore Default Content" and "Restore Previous"
 * buttons for reverting all section headings/subheadings.
 *
 * This is a UI-only global — no real data is stored. The buttons trigger
 * API calls to restore content from sectionDefaults.json or the last saved snapshot.
 */

const DefaultSettings: GlobalConfig = {
  slug: 'default-settings',
  label: 'Default Settings',
  versions: false,
  access: { read: () => true, update: () => true },
  fields: [
    {
      name: 'restoreHelper',
      type: 'ui',
      admin: {
        components: { Field: '/components/RestoreSettingsPanel' },
      },
    },
    // Hidden field to store the previous state snapshot
    {
      name: '_previousSnapshot',
      type: 'json',
      admin: { condition: () => false },
    },
  ],
}

export default DefaultSettings
