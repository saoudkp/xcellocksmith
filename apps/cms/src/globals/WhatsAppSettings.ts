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
      type: 'ui',
      name: 'connectionPanel',
      label: ' ',
      admin: {
        components: {
          Field: '/components/WhatsAppConnectionPanel',
        },
      },
    },
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
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'wahaUrl',
          type: 'text',
          label: 'WAHA URL',
          admin: {
            description: 'Base URL of your WAHA Docker container',
            placeholder: 'http://155.133.26.35:3001',
          },
        },
        {
          name: 'wahaSession',
          type: 'text',
          label: 'Session name',
          defaultValue: 'default',
          admin: { description: 'Leave as "default".', placeholder: 'default' },
        },
        {
          name: 'wahaApiKey',
          type: 'text',
          label: 'API key',
          admin: { description: 'WAHA API key for authentication.' },
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
            description: 'International format, digits only. e.g. 12165551234',
            placeholder: '12165551234',
          },
        },
        {
          name: 'groupId',
          type: 'text',
          label: 'WhatsApp Group ID',
          admin: {
            description: 'Use "Load Groups" in the connection panel above to find the ID.',
            placeholder: '120363405575265439@g.us',
          },
        },
      ],
    },
  ],
}

export default WhatsAppSettings
