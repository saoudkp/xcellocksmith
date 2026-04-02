import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function getWahaConfig() {
  const payload = await getPayload({ config })
  const user = null // TODO: check auth via cookies
  const settings = await payload.findGlobal({ slug: 'whatsapp-settings' as any }) as any
  return {
    url: settings?.wahaUrl || process.env.WAHA_URL || '',
    apiKey: settings?.wahaApiKey || process.env.WAHA_API_KEY || '',
    session: settings?.wahaSession || process.env.WAHA_SESSION || 'default',
  }
}

function headers(apiKey: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) h['X-Api-Key'] = apiKey
  return h
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const cfg = await getWahaConfig()
  if (!cfg.url) return NextResponse.json({ error: 'WAHA not configured' }, { status: 400 })

  try {
    if (action === 'status') {
      const res = await fetch(`${cfg.url}/api/sessions`, { headers: headers(cfg.apiKey) })
      const sessions = await res.json()
      const session = Array.isArray(sessions) ? sessions.find((s: any) => s.name === cfg.session) : null
      return NextResponse.json({
        connected: session?.status === 'WORKING',
        status: session?.status || 'STOPPED',
        phone: session?.me?.id?.replace('@c.us', '') || null,
        name: session?.me?.pushName || null,
      })
    }

    if (action === 'qr') {
      const res = await fetch(`${cfg.url}/api/${cfg.session}/auth/qr?format=image`, { headers: headers(cfg.apiKey) })
      if (!res.ok) return NextResponse.json({ error: 'No QR available' }, { status: 404 })
      const blob = await res.arrayBuffer()
      return new NextResponse(blob, { headers: { 'Content-Type': 'image/png' } })
    }

    if (action === 'groups') {
      const res = await fetch(`${cfg.url}/api/${cfg.session}/chats?chatTypes=group`, { headers: headers(cfg.apiKey) })
      if (!res.ok) {
        // Fallback: try listing all chats and filter groups
        const res2 = await fetch(`${cfg.url}/api/${cfg.session}/chats`, { headers: headers(cfg.apiKey) })
        if (!res2.ok) return NextResponse.json([])
        const chats = await res2.json()
        const groups = Array.isArray(chats) ? chats.filter((c: any) => c.id?.includes('@g.us')) : []
        return NextResponse.json(groups.map((g: any) => ({ id: g.id, name: g.name || g.id })))
      }
      const groups = await res.json()
      return NextResponse.json(Array.isArray(groups) ? groups.map((g: any) => ({ id: g.id, name: g.name || g.id })) : [])
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const cfg = await getWahaConfig()
  if (!cfg.url) return NextResponse.json({ error: 'WAHA not configured' }, { status: 400 })

  try {
    if (action === 'start') {
      // Stop existing session first (ignore errors)
      await fetch(`${cfg.url}/api/sessions/${cfg.session}/stop`, { method: 'POST', headers: headers(cfg.apiKey) }).catch(() => {})
      // Start new session with store enabled
      const res = await fetch(`${cfg.url}/api/sessions/start`, {
        method: 'POST',
        headers: headers(cfg.apiKey),
        body: JSON.stringify({ name: cfg.session, config: { noweb: { store: { enabled: true, fullSync: true } } } }),
      })
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (action === 'stop') {
      const res = await fetch(`${cfg.url}/api/sessions/${cfg.session}/stop`, { method: 'POST', headers: headers(cfg.apiKey) })
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
