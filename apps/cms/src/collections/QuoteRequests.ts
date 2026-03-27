import type { CollectionConfig } from 'payload'
import { quoteRequestsAccess } from '@/access'
import { rejectHoneypot } from '@/hooks/rejectHoneypot'
import { sendQuoteNotification } from '@/hooks/sendQuoteNotification'

const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: { singular: 'Quote Request', plural: 'Quote Requests' },
  versions: false,
  admin: {
    group: 'Leads',
    useAsTitle: 'name',
    description: 'Incoming quote requests submitted from the website',
    defaultColumns: ['name', 'phone', 'serviceType', 'status', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'email', 'location'],
  },
  access: quoteRequestsAccess,
  hooks: {
    beforeChange: [rejectHoneypot],
    afterChange: [sendQuoteNotification],
  },
  fields: [
    // ── Status (admin-managed, top of form) ──────────────────────────────
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: '🔵 New', value: 'new' },
        { label: '📞 Contacted', value: 'contacted' },
        { label: '💬 Quoted', value: 'quoted' },
        { label: '✅ Won', value: 'won' },
        { label: '❌ Lost', value: 'lost' },
      ],
      admin: {
        description: 'Update this as you work through the lead',
        position: 'sidebar',
      },
    },

    // ── Customer Info ────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Customer Info',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { width: '50%', readOnly: true, description: 'Submitted by customer' },
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              admin: { width: '50%', readOnly: true, description: 'Submitted by customer' },
            },
          ],
        },
        {
          name: 'email',
          type: 'email',
          admin: { readOnly: true, description: 'Submitted by customer (optional)' },
        },
      ],
    },

    // ── Service Details ──────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Service Details',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'serviceType',
              type: 'select',
              options: [
                { label: 'Residential', value: 'residential' },
                { label: 'Commercial', value: 'commercial' },
                { label: 'Automotive', value: 'automotive' },
              ],
              admin: { width: '50%', readOnly: true, description: 'Service category selected by customer' },
            },
            {
              name: 'service',
              type: 'relationship',
              relationTo: 'services',
              admin: { width: '50%', readOnly: true, description: 'Specific service (if selected)' },
            },
          ],
        },
        {
          name: 'body',
          type: 'textarea',
          admin: {
            readOnly: true,
            description: 'Issue description provided by the customer',
            rows: 5,
          },
        },
      ],
    },

    // ── Location ─────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Location',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'location',
          type: 'text',
          admin: { readOnly: true, description: 'Address or area entered by customer' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'lat',
              type: 'number',
              admin: { width: '50%', readOnly: true, description: 'GPS latitude (auto-captured)' },
            },
            {
              name: 'lng',
              type: 'number',
              admin: { width: '50%', readOnly: true, description: 'GPS longitude (auto-captured)' },
            },
          ],
        },
      ],
    },

    // ── Attachment ───────────────────────────────────────────────────────
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Photo uploaded by the customer (e.g. lock, key, vehicle)',
        readOnly: true,
      },
    },

    // ── Admin Notes (editable) ───────────────────────────────────────────
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes — not visible to the customer',
        rows: 4,
      },
    },

    // ── Hidden ───────────────────────────────────────────────────────────
    { name: 'honeypot', type: 'text', admin: { hidden: true } },
  ],
}

export default QuoteRequests
