import type { GlobalConfig } from 'payload'
import { isAuthenticated } from '@/access'

const WhatsAppSettings: GlobalConfig = {
  slug: 'whatsapp-settings',
  label: 'WhatsApp Notifications',
  versions: false,
  admin: {
    group: 'Leads',
    description: 'Configure WAHA (self-hosted WhatsApp) to receive instant notifications when a new quote request comes in.',
  },
  access: {
    read: isAuthenticated,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enable WhatsApp notifications',
      defaultValue: false,
      admin: {
        description: 'When checked, a WhatsApp message is sent to the business number on every new quote request.',
      },
    },
    {
      type: 'collapsible',
      label: 'WAHA Connection',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'wahaUrl',
          type: 'text',
          label: 'WAHA URL',
          admin: {
            description: 'Base URL of your WAHA Docker container, e.g. http://155.133.26.35:3001',
            placeholder: 'http://155.133.26.35:3001',
          },
        },
        {
          name: 'wahaSession',
          type: 'text',
          label: 'Session name',
          defaultValue: 'default',
          admin: {
            description: 'WAHA session name — leave as "default".',
            placeholder: 'default',
          },
        },
        {
          name: 'wahaApiKey',
          type: 'text',
          label: 'API key',
          admin: {
            description: 'WAHA API key for authentication.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Recipient',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'businessPhone',
          type: 'text',
          label: 'Business WhatsApp number',
          admin: {
            description: 'International format, digits only — no +, spaces or dashes. e.g. 12165551234',
            placeholder: '12165551234',
          },
        },
        {
          name: 'groupId',
          type: 'text',
          label: 'WhatsApp Group ID',
          admin: {
            description: 'Send notifications to a group. Use the "Load Groups" button below to find the ID.',
            placeholder: '120363405575265439@g.us',
          },
        },
      ],
    },
    {
      type: 'ui',
      name: 'connectionPanel',
      label: 'WhatsApp Connection Manager',
      admin: {
        components: {
          Field: '/components/WhatsAppConnectionPanel',
        },
      },
    },
  ],
}

export default WhatsAppSettings
