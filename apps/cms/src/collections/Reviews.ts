import type { CollectionConfig } from 'payload'
import { reviewsAccess } from '@/access'
import { sendReviewNotification } from '@/hooks/sendReviewNotification'

const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Content',
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
    { name: 'isApproved', type: 'checkbox', defaultValue: false },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
  ],
}

export default Reviews
