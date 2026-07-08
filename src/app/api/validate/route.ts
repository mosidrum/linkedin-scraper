import { NextRequest, NextResponse } from 'next/server'
import { validateLinkedInUrl } from '@/lib/linkedin/validator'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.url !== 'string') {
    return NextResponse.json({ valid: false, error: 'Missing url field' }, { status: 400 })
  }

  const result = validateLinkedInUrl(body.url)
  return NextResponse.json(result)
}
