import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Sends a WhatsApp message via a self-hosted WAHA instance.
 * Configuration is read from the WhatsApp Settings global in the CMS admin.
 * Falls back to env vars if the global is not configured.
 *
 * Env var fallbacks:
 *   WAHA_URL, WAHA_BUSINESS_PHONE, WAHA_SESSION, WAHA_API_KEY
 */
export async function sendWhatsApp(message: string): Promise<void> {
  // Try to read config from CMS global first
  let wahaUrl: string | undefined
  let businessPhone: string | undefined
  let session: string | undefined
  let apiKey: string | undefined
  let enabled = true

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'whatsapp-settings' as any }) as any
    if (settings) {
      enabled = settings.enabled ?? false
      wahaUrl = settings.wahaUrl || undefined
      businessPhone = settings.businessPhone || undefined
      session = settings.wahaSession || undefined
      apiKey = settings.wahaApiKey || undefined
    }
  } catch {
    // Global not available yet — fall through to env vars
  }

  // Fall back to env vars
  wahaUrl = wahaUrl || process.env.WAHA_URL
  businessPhone = businessPhone || process.env.WAHA_BUSINESS_PHONE
  session = session || process.env.WAHA_SESSION || 'default'
  apiKey = apiKey || process.env.WAHA_API_KEY

  if (!enabled || !wahaUrl || !businessPhone) {
    return
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  const res = await fetch(`${wahaUrl}/api/sendText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      session,
      chatId: `${businessPhone}@c.us`,
      text: message,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`WAHA sendText failed: ${res.status} ${body}`)
  }
}
