import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function getWahaConfig() {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'whatsapp-settings' as any }) as any
    return {
      url: settings?.wahaUrl || process.env.WAHA_URL || '',
      apiKey: settings?.wahaApiKey || process.env.WAHA_API_KEY || '',
      session: settings?.wahaSession || process.env.WAHA_SESSION || 'default',
    }
  } catch {
    return {
      url: process.env.WAHA_URL || '',
      apiKey: process.env.WAHA_API_KEY || '',
      session: process.env.WAHA_SESSION || 'default',
    }
  }
}

function wahaHeaders(apiKey: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) h['X-Api-Key'] = apiKey
  return h
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const cfg = await getWahaConfig()
  if (!cfg.url) return NextResponse.json({ error: 'WAHA URL not configured' }, { status: 400 })

  try {
    if (action === 'status') {
      const res = await fetch(`${cfg.url}/api/sessions`, { headers: wahaHeaders(cfg.apiKey) })
      if (!res.ok) return NextResponse.json({ connected: false, status: 'ERROR', error: `WAHA ${res.status}` })
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
      // Return QR as base64 data URL
      const res = await fetch(`${cfg.url}/api/${cfg.session}/auth/qr?format=image`, {
        headers: wahaHeaders(cfg.apiKey),
      })
      if (!res.ok) return NextResponse.json({ qr: null, error: 'QR not available yet' })
      const buffer = await res.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return NextResponse.json({ qr: `data:image/png;base64,${base64}` })
    }

    if (action === 'groups') {
      // Try chatTypes=group first, fallback to all chats
      let res = await fetch(`${cfg.url}/api/${cfg.session}/chats?chatTypes=group`, { headers: wahaHeaders(cfg.apiKey) })
      if (!res.ok) {
        res = await fetch(`${cfg.url}/api/${cfg.session}/chats`, { headers: wahaHeaders(cfg.apiKey) })
      }
      if (!res.ok) return NextResponse.json([])
      const chats = await res.json()
      const groups = Array.isArray(chats) ? chats.filter((c: any) => String(c.id || '').includes('@g.us')) : []
      return NextResponse.json(groups.map((g: any) => ({ id: g.id, name: g.name || g.id })))
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
  if (!cfg.url) return NextResponse.json({ error: 'WAHA URL not configured' }, { status: 400 })

  try {
    if (action === 'start') {
      // Delete existing session completely
      await fetch(`${cfg.url}/api/sessions/${cfg.session}/stop`, { method: 'POST', headers: wahaHeaders(cfg.apiKey) }).catch(() => {})
      await fetch(`${cfg.url}/api/sessions/${cfg.session}`, { method: 'DELETE', headers: wahaHeaders(cfg.apiKey) }).catch(() => {})
      // Wait for cleanup
      await new Promise(r => setTimeout(r, 2000))
      // Start fresh
      const res = await fetch(`${cfg.url}/api/sessions/start`, {
        method: 'POST',
        headers: wahaHeaders(cfg.apiKey),
        body: JSON.stringify({ name: cfg.session, config: { noweb: { store: { enabled: true, fullSync: true } } } }),
      })
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (action === 'stop') {
      await fetch(`${cfg.url}/api/sessions/${cfg.session}/stop`, { method: 'POST', headers: wahaHeaders(cfg.apiKey) }).catch(() => {})
      await fetch(`${cfg.url}/api/sessions/${cfg.session}`, { method: 'DELETE', headers: wahaHeaders(cfg.apiKey) }).catch(() => {})
      return NextResponse.json({ ok: true })
    }

    if (action === 'update-settings') {
      const body = await request.json()
      const payload = await getPayload({ config })
      const updateData: Record<string, unknown> = {}
      if (body.businessPhone) updateData.businessPhone = body.businessPhone
      if (body.groupId) updateData.groupId = body.groupId
      if (body.groupId === '') updateData.groupId = ''
      await payload.updateGlobal({ slug: 'whatsapp-settings' as any, data: updateData as any })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
