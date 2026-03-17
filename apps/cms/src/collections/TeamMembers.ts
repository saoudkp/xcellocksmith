import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    group: 'Content',
  },
  access: publicReadAdminWrite,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'experience', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'specialties',
      type: 'array',
      fields: [{ name: 'specialty', type: 'text' }],
    },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'file', type: 'upload', relationTo: 'media' },
        { name: 'fileType', type: 'select', options: ['image', 'pdf'] },
        { name: 'expiryDate', type: 'date' },
        {
          name: 'isVerified',
          type: 'checkbox',
          access: { update: ({ req }) => Boolean(req.user) },
        },
      ],
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number' },
  ],
}

export default TeamMembers
