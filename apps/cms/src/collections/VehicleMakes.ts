import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '@/access'

const VehicleMakes: CollectionConfig = {
  slug: 'vehicle-makes',
  admin: {
    group: 'Vehicles',
    useAsTitle: 'name',
    description: 'Car brands your locksmith business supports. Add a logo and models for each make.',
    defaultColumns: ['name', 'logoUrl', 'isActive', 'sortOrder'],
  },
  labels: {
    singular: 'Vehicle Make',
    plural: 'Vehicle Makes',
  },
  access: publicReadAdminWrite,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Brand name (e.g. Chevrolet, Ford, Toyota)',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload a logo image (optional — you can use a URL instead)',
      },
    },
    {
      name: 'logoUrl',
      type: 'text',
      admin: {
        description: 'Or paste a logo image URL here (e.g. https://www.carlogos.org/car-logos/ford-logo.png)',
      },
    },
    {
      name: 'models',
      type: 'array',
      admin: {
        description: 'Add all car models for this brand',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Model name (e.g. F-150, Silverado, Camry)',
          },
        },
        {
          name: 'supportedServices',
          type: 'array',
          admin: {
            description: 'List of locksmith services available for this model',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'service',
              type: 'text',
              required: true,
              admin: {
                description: 'Service name (e.g. Car Lockout Services, Car Key Replacement)',
              },
            },
          ],
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide this model from the website',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide this brand from the website',
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        description: 'Display order (lower = first)',
        position: 'sidebar',
      },
    },
  ],
}

export default VehicleMakes
