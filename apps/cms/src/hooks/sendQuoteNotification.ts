import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail } from '@/email/send'
import { quoteRequestBusinessTemplate } from '@/email/templates/quote-request-business'
import { quoteRequestCustomerTemplate } from '@/email/templates/quote-request-customer'
import { sendWhatsApp, sendWhatsAppLocation } from '@/utils/sendWhatsApp'

const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'admin@xcel-locksmith.com'
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '(216) 555-1234'

/**
 * afterChange hook for quote-requests collection.
 * On creation, sends a business notification email and (if the customer
 * provided an email) a customer confirmation email.
 *
 * Email failures are caught and logged — they never break the parent operation.
 */
export const sendQuoteNotification: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') {
    return doc
  }

  try {
    // Always send business notification
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: 'New Quote Request from ' + (doc.name || 'Website Visitor'),
      html: quoteRequestBusinessTemplate({
        name: doc.name,
        phone: doc.phone,
        email: doc.email ?? null,
        serviceType: doc.serviceType ?? null,
        location: doc.location ?? null,
        notes: doc.body ?? doc.notes ?? null,
      }),
    })

    // Send customer confirmation if email provided
    if (doc.email) {
      await sendEmail({
        to: doc.email,
        subject: 'Your Quote Request — Xcel Locksmith',
        html: quoteRequestCustomerTemplate({
          name: doc.name,
          businessPhone: BUSINESS_PHONE,
          businessEmail: BUSINESS_EMAIL,
        }),
      })
    }

    // Send WhatsApp notification to business (non-blocking, failure is logged only)
    const waLines = [
      '📋 *New Quote Request*',
      `👤 ${doc.name}`,
      `📞 ${doc.phone}`,
      doc.email ? `📧 ${doc.email}` : null,
      doc.serviceType ? `🔧 ${doc.serviceType.charAt(0).toUpperCase() + doc.serviceType.slice(1)}` : null,
      doc.location ? `📍 ${doc.location}` : null,
      doc.lat && doc.lng ? `🗺️ https://maps.google.com/maps?q=${doc.lat},${doc.lng}` : null,
      doc.body ? `💬 ${doc.body}` : null,
    ].filter(Boolean).join('\n')

    await sendWhatsApp(waMessage).catch((err: unknown) => {
      console.error('[sendQuoteNotification] WhatsApp text failed:', {
        quoteRequestId: doc.id,
        error: err instanceof Error ? err.message : String(err),
      })
    })

    // Send location pin if coordinates available
    if (doc.lat && doc.lng) {
      await sendWhatsAppLocation(doc.lat, doc.lng, doc.location || doc.name).catch((err: unknown) => {
        console.error('[sendQuoteNotification] WhatsApp location failed:', {
          quoteRequestId: doc.id,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    }

  } catch (error) {
    console.error('[sendQuoteNotification] Failed to send notification emails:', {
      quoteRequestId: doc.id,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}

export default sendQuoteNotification
