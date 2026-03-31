import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail } from '@/email/send'
import { quoteRequestBusinessTemplate } from '@/email/templates/quote-request-business'
import { quoteRequestCustomerTemplate } from '@/email/templates/quote-request-customer'
import { sendWhatsApp, sendWhatsAppLocation } from '@/utils/sendWhatsApp'

const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'admin@xcel-locksmith.com'
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '(216) 555-1234'

export const sendQuoteNotification: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') return doc

  try {
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: 'New Quote Request from ' + (doc.name || 'Website Visitor'),
      html: quoteRequestBusinessTemplate({
        name: doc.name, phone: doc.phone, email: doc.email ?? null,
        serviceType: doc.serviceType ?? null, location: doc.location ?? null,
        notes: doc.body ?? doc.notes ?? null,
      }),
    })

    if (doc.email) {
      await sendEmail({
        to: doc.email,
        subject: 'Your Quote Request \u2014 Xcel Locksmith',
        html: quoteRequestCustomerTemplate({
          name: doc.name, businessPhone: BUSINESS_PHONE, businessEmail: BUSINESS_EMAIL,
        }),
      })
    }

    // Build WhatsApp message
    const lines: string[] = [
      '\ud83d\udccb *New Quote Request*',
      `\ud83d\udc64 ${doc.name}`,
      `\ud83d\udcde ${doc.phone}`,
    ]
    if (doc.email) lines.push(`\ud83d\udce7 ${doc.email}`)
    if (doc.serviceType) lines.push(`\ud83d\udd27 ${doc.serviceType.charAt(0).toUpperCase() + doc.serviceType.slice(1)}`)
    if (doc.location) lines.push(`\ud83d\udccd ${doc.location}`)
    if (doc.lat && doc.lng) lines.push(`\ud83d\uddfa\ufe0f https://maps.google.com/maps?q=${doc.lat},${doc.lng}`)
    if (doc.body) lines.push(`\ud83d\udcac ${doc.body}`)

    // Photo link
    if (doc.photo) {
      const photoUrl = typeof doc.photo === 'object' ? (doc.photo as Record<string, unknown>).url as string : null
      if (photoUrl) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cms.xcellocksmith.com'
        const fullUrl = photoUrl.startsWith('http') ? photoUrl : `${siteUrl}${photoUrl}`
        lines.push(`\ud83d\udcf7 Photo: ${fullUrl}`)
      }
    }

    await sendWhatsApp(lines.join('\n')).catch((err: unknown) => {
      console.error('[sendQuoteNotification] WhatsApp text failed:', {
        quoteRequestId: doc.id, error: err instanceof Error ? err.message : String(err),
      })
    })

    if (doc.lat && doc.lng) {
      await sendWhatsAppLocation(doc.lat, doc.lng, doc.location || doc.name).catch((err: unknown) => {
        console.error('[sendQuoteNotification] WhatsApp location failed:', {
          quoteRequestId: doc.id, error: err instanceof Error ? err.message : String(err),
        })
      })
    }
  } catch (error) {
    console.error('[sendQuoteNotification] Failed to send notifications:', {
      quoteRequestId: doc.id, error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}

export default sendQuoteNotification
