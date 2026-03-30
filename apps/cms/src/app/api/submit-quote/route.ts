import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { quoteSchema } from './schema'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_SITE_URL ? `https://www.${new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname}` : '',
].filter(Boolean) as string[]

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const body = await request.json()
    const result = quoteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400, headers },
      )
    }

    const data = result.data

    // Honeypot check — silently accept without creating a document
    if (data.honeypot && data.honeypot.length > 0) {
      return NextResponse.json({ success: true }, { status: 200, headers })
    }

    const payload = await getPayload({ config })

    const doc = await payload.create({
      collection: 'quote-requests',
      data: data as any,
    })

    return NextResponse.json({ success: true, id: doc.id }, { status: 201, headers })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers },
    )
  }
}
