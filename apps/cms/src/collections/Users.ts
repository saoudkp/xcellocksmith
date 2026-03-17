import type { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: { singular: 'Admin User', plural: 'Admin Users' },
  admin: {
    group: 'Admin',
    useAsTitle: 'email',
    description: 'Manage admin accounts that can log into this dashboard',
  },
  fields: [],
}

export default Users
