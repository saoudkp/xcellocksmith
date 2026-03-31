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
            description: 'Base URL of your WAHA Docker container, e.g. http://localhost:3002',
            placeholder: 'http://localhost:3002',
          },
        },
        {
          name: 'wahaSession',
          type: 'text',
          label: 'Session name',
          defaultValue: 'default',
          admin: {
            description: 'WAHA session name — leave as "default" unless you created a custom one.',
            placeholder: 'default',
          },
        },
        {
          name: 'wahaApiKey',
          type: 'text',
          label: 'API key (optional)',
          admin: {
            description: 'Only required if you secured WAHA with an API key.',
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
          label: 'WhatsApp Group ID (optional)',
          admin: {
            description: 'Send notifications to a group instead of direct message. Format: 120363XXXXXXXXX@g.us',
            placeholder: '120363405575265439@g.us',
          },
        },
      ],
    },
  ],
}

export default WhatsAppSettings
