import type { CollectionConfig } from 'payload'
import { reviewsAccess } from '@/access'
import { sendReviewNotification } from '@/hooks/sendReviewNotification'

const Reviews: CollectionConfig = {
  slug: 'reviews',
  versions: false,
  admin: {
    group: 'Content',
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'starRating', 'isApproved', 'isActive'],
  },
  access: reviewsAccess,
  hooks: {
    afterChange: [sendReviewNotification],
  },
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'starRating', type: 'number', min: 1, max: 5, required: true },
    { name: 'reviewText', type: 'textarea', required: true },
    { name: 'reviewDate', type: 'date' },
    {
      name: 'source',
      type: 'select',
      options: ['website', 'google', 'yelp', 'manual'],
    },
    { name: 'isApproved', type: 'checkbox', defaultValue: false, label: 'Approved', admin: { position: 'sidebar', description: 'Approve this review' } },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Show on Website', admin: { position: 'sidebar', description: 'Uncheck to hide from website' } },
  ],
}

export default Reviews
