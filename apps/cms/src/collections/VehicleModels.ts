import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const VehicleModels: CollectionConfig = {
  slug: 'vehicle-models',
  admin: {
    group: 'Vehicles',
    hidden: true, // Legacy collection — models are now inline in Vehicle Makes
  },
  access: publicReadAdminWrite,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'make', type: 'relationship', relationTo: 'vehicle-makes', required: true },
    { name: 'supportedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}

export default VehicleModels
