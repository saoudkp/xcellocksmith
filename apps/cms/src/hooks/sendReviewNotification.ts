import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail } from '@/email/send'
import { reviewNotificationTemplate } from '@/email/templates/review-notification'

const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'admin@xcel-locksmith.com'

/**
 * afterChange hook for reviews collection.
 * On creation, sends an admin notification email about the new review.
 *
 * Email failures are caught and logged — they never break the parent operation.
 */
export const sendReviewNotification: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') {
    return doc
  }

  try {
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: `New Review from ${doc.customerName || 'Anonymous'}`,
      html: reviewNotificationTemplate({
        customerName: doc.customerName,
        starRating: doc.starRating,
        reviewText: doc.reviewText,
      }),
    })
  } catch (error) {
    console.error('[sendReviewNotification] Failed to send notification email:', {
      reviewId: doc.id,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}

export default sendReviewNotification
