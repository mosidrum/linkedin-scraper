import { NextRequest, NextResponse } from 'next/server'
import { validateLinkedInUrl } from '@/lib/linkedin/validator'
import { getProvider } from '@/lib/linkedin/providers/registry'
import { profileCache } from '@/lib/linkedin/cache'
import { LinkedInImportError } from '@/lib/linkedin/errors'
import type { ProfileErrorCode } from '@/lib/linkedin/types'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.url !== 'string') {
    return errorResponse('INVALID_URL', 'Missing url field', 400)
  }

  const validation = validateLinkedInUrl(body.url)
  if (!validation.valid || !validation.normalizedUrl) {
    return errorResponse('INVALID_URL', validation.error ?? 'Invalid URL', 422)
  }

  const normalizedUrl = validation.normalizedUrl

  // Cache hit
  const cached = profileCache.get(normalizedUrl)
  if (cached) {
    return NextResponse.json({ profile: cached, cached: true })
  }

  const provider = getProvider(body.provider)

  try {
    const profile = await provider.fetchProfile(normalizedUrl)
    profileCache.set(normalizedUrl, profile)
    return NextResponse.json({ profile, cached: false })
  } catch (err) {
    if (err instanceof LinkedInImportError) {
      const status =
        err.code === 'RATE_LIMITED' ? 429
        : err.code === 'NOT_FOUND' ? 404
        : err.code === 'PRIVATE_PROFILE' ? 403
        : 502
      return errorResponse(err.code, err.message, status)
    }

    const message = err instanceof Error ? err.message : 'Unknown error'
    return errorResponse('PROVIDER_ERROR', message, 502)
  }
}

function errorResponse(code: ProfileErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}
