import { NextRequest, NextResponse } from 'next/server'
import { validateLinkedInUrl } from '@/lib/linkedin/validator'
import { getProvider } from '@/lib/linkedin/providers/registry'
import { LinkedInImportError } from '@/lib/linkedin/errors'
import { ApifyProvider } from '@/lib/linkedin/providers/apify'
import { MockProvider } from '@/lib/linkedin/providers/mock'
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

  const maxPosts = Math.min(Number(body.maxPosts) || 10, 50)
  const provider = getProvider(body.provider)

  try {
    let posts
    if (provider instanceof ApifyProvider || provider instanceof MockProvider) {
      posts = await provider.fetchPosts(validation.normalizedUrl, maxPosts)
    } else {
      return errorResponse('PROVIDER_ERROR', 'This provider does not support fetching posts', 501)
    }
    return NextResponse.json({ posts })
  } catch (err) {
    if (err instanceof LinkedInImportError) {
      const status = err.code === 'RATE_LIMITED' ? 429 : 502
      return errorResponse(err.code, err.message, status)
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return errorResponse('PROVIDER_ERROR', message, 502)
  }
}

function errorResponse(code: ProfileErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}
