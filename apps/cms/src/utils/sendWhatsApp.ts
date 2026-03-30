import { getPayload } from 'payload'
import config from '@payload-config'

interface WahaConfig {
  wahaUrl: string
  session: string
  apiKey: string
  chatId: string
}

async function getWahaConfig(): Promise<WahaConfig | null> {
  let wahaUrl: string | undefined
  let businessPhone: string | undefined
  let session: string | undefined
  let apiKey: string | undefined
  let groupId: string | undefined
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
      groupId = settings.groupId || undefined
    }
  } catch { /* fall through to env vars */ }

  wahaUrl = wahaUrl || process.env.WAHA_URL
  businessPhone = businessPhone || process.env.WAHA_BUSINESS_PHONE
  session = session || process.env.WAHA_SESSION || 'default'
  apiKey = apiKey || process.env.WAHA_API_KEY || ''
  groupId = groupId || process.env.WAHA_GROUP_ID

  if (!enabled || !wahaUrl || !businessPhone) return null

  const chatId = groupId || `${businessPhone}@c.us`
  return { wahaUrl, session, apiKey, chatId }
}

/** Send a text message via WAHA */
export async function sendWhatsApp(message: string): Promise<void> {
  const cfg = await getWahaConfig()
  if (!cfg) return

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers['X-Api-Key'] = cfg.apiKey

  const res = await fetch(`${cfg.wahaUrl}/api/sendText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ session: cfg.session, chatId: cfg.chatId, text: message }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`WAHA sendText failed: ${res.status} ${body}`)
  }
}

/** Send an image via WAHA (URL-based) */
export async function sendWhatsAppImage(imageUrl: string, caption?: string): Promise<void> {
  const cfg = await getWahaConfig()
  if (!cfg) return

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers['X-Api-Key'] = cfg.apiKey

  const res = await fetch(`${cfg.wahaUrl}/api/sendImage`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      session: cfg.session,
      chatId: cfg.chatId,
      file: { url: imageUrl },
      caption: caption || '',
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`WAHA sendImage failed: ${res.status} ${body}`)
  }
}

/** Send a location pin via WAHA */
export async function sendWhatsAppLocation(lat: number, lng: number, title?: string): Promise<void> {
  const cfg = await getWahaConfig()
  if (!cfg) return

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers['X-Api-Key'] = cfg.apiKey

  const res = await fetch(`${cfg.wahaUrl}/api/sendLocation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      session: cfg.session,
      chatId: cfg.chatId,
      latitude: lat,
      longitude: lng,
      title: title || 'Customer Location',
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`WAHA sendLocation failed: ${res.status} ${body}`)
  }
}
