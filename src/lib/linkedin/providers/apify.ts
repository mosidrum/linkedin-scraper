import { validateLinkedInUrl } from '../validator'
import { normalizeProfile } from '../normalizer'
import {
  PrivateProfileError,
  ProfileNotFoundError,
  RateLimitError,
  ProviderError,
  NetworkError,
} from '../errors'
import type { ProfileProvider } from './base'
import type { LinkedInProfile, ValidationResult, PostItem, PostComment } from '../types'

const ACTOR_ID = 'harvestapi~linkedin-profile-scraper'
const APIFY_BASE = 'https://api.apify.com/v2'
const POLL_INTERVAL_MS = 1500
const TIMEOUT_MS = 90_000

type RunStatus = 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTING' | 'ABORTED' | 'TIMED-OUT'

interface ApifyRun {
  id: string
  status: RunStatus
  statusMessage?: string
  defaultDatasetId: string
}

export class ApifyProvider implements ProfileProvider {
  readonly id = 'apify'
  readonly name = 'Apify (harvestapi/linkedin-profile-scraper)'

  private readonly token: string

  constructor(token: string) {
    this.token = token
  }

  validateUrl(url: string): ValidationResult {
    return validateLinkedInUrl(url)
  }

  async fetchProfile(url: string): Promise<LinkedInProfile> {
    const validation = validateLinkedInUrl(url)
    if (!validation.valid || !validation.normalizedUrl) {
      throw new ProviderError(validation.error)
    }

    const profileUrl = validation.normalizedUrl
    const run = await this.startRun(profileUrl)
    const finishedRun = await this.pollUntilDone(run.id)
    const items = await this.fetchDataset(finishedRun.defaultDatasetId)

    if (!items.length) {
      const msg = finishedRun.statusMessage?.toLowerCase() ?? ''
      if (msg.includes('private') || msg.includes('restricted')) {
        throw new PrivateProfileError(profileUrl)
      }
      throw new ProfileNotFoundError(profileUrl)
    }

    return normalizeProfile(items[0], profileUrl, this.id)
  }

  async fetchPosts(profileUrl: string, maxPosts = 10, scrapeComments = false): Promise<PostItem[]> {
    const run = await this.startPostsRun(profileUrl, maxPosts, scrapeComments)
    const finishedRun = await this.pollUntilDone(run.id)
    const items = await this.fetchDataset(finishedRun.defaultDatasetId, 50)
    return items.map((raw, i) => normalizePost(raw, i))
  }

  private async startPostsRun(profileUrl: string, maxPosts: number, scrapeComments: boolean): Promise<ApifyRun> {
    const res = await fetch(`${APIFY_BASE}/acts/harvestapi~linkedin-profile-posts/runs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUrls: [profileUrl],
        maxPosts,
        scrapeComments,
        maxComments: scrapeComments ? 5 : 0,
      }),
    })
    if (res.status === 429) throw new RateLimitError()
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ProviderError(`Failed to start posts run: ${res.status} ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    return data.data as ApifyRun
  }

  private async startRun(profileUrl: string): Promise<ApifyRun> {
    const res = await fetch(`${APIFY_BASE}/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries: [profileUrl],
        profileScraperMode: 'Profile details no email ($4 per 1k)',
      }),
    })

    if (res.status === 429) throw new RateLimitError()
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ProviderError(`Failed to start Apify run: ${res.status} ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    return data.data as ApifyRun
  }

  private async pollUntilDone(runId: string): Promise<ApifyRun> {
    const deadline = Date.now() + TIMEOUT_MS

    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS)

      const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }).catch((err: Error) => { throw new NetworkError(err.message) })

      if (!res.ok) throw new ProviderError(`Run status check failed: ${res.status}`)

      const data = await res.json()
      const run: ApifyRun = data.data

      if (run.status === 'SUCCEEDED') return run

      if (['FAILED', 'ABORTED', 'ABORTING', 'TIMED-OUT'].includes(run.status)) {
        const msg = (run.statusMessage ?? '').toLowerCase()
        if (msg.includes('private') || msg.includes('restricted')) throw new PrivateProfileError('')
        if (msg.includes('rate') || msg.includes('429')) throw new RateLimitError()
        throw new ProviderError(`Actor run ${run.status}: ${run.statusMessage ?? 'unknown'}`)
      }
    }

    throw new NetworkError('Import timed out. LinkedIn may be slow — please try again.')
  }

  private async fetchDataset(datasetId: string, limit = 1): Promise<Record<string, unknown>[]> {
    const res = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?clean=true&limit=${limit}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    }).catch((err: Error) => { throw new NetworkError(err.message) })

    if (!res.ok) throw new ProviderError(`Failed to fetch dataset: ${res.status}`)
    return res.json()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePost(raw: Record<string, unknown>, index: number): PostItem {
  const r = raw as Record<string, unknown>
  const num = (v: unknown) => { const n = Number(v); return isNaN(n) || v === null || v === undefined ? null : n }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Log raw keys once to help diagnose missing field aliases
  if (index === 0) console.log('[apify] raw post keys:', Object.keys(r))

  // Stats may be nested under a stats/socialCounts/engagement object
  const stats = (r.stats ?? r.socialCounts ?? r.engagement ?? r.socialActivity ?? {}) as Record<string, unknown>

  let imageUrl: string | null = null
  const images = r.images ?? r.media ?? r.articleContent
  if (Array.isArray(images) && images.length > 0) {
    imageUrl = str((images[0] as Record<string, unknown>)?.url ?? (images[0] as Record<string, unknown>)?.src ?? images[0]) || null
  } else if (r.image) {
    imageUrl = str((r.image as Record<string, unknown>)?.url ?? r.image) || null
  }

  const rawComments = r.comments ?? r.topComments ?? []
  const comments: PostComment[] = Array.isArray(rawComments)
    ? rawComments.map((c: Record<string, unknown>, ci: number) => ({
        id: str(c.id ?? c.urn ?? c.entityUrn) || `comment-${index}-${ci}`,
        text: str(c.text ?? c.content ?? c.commentary ?? c.comment),
        authorName: str(c.authorName ?? (c.author as Record<string, unknown>)?.name ?? c.commenterName ?? c.name) || null,
        postedAt: str(c.postedAt ?? c.createdAt ?? c.date ?? c.publishedAt ?? c.postedDate) || null,
        likesCount: num(c.likesCount ?? c.likes ?? c.numLikes ?? (c.stats as Record<string, unknown>)?.numLikes),
      }))
    : []

  // Build LinkedIn post URL from ID if not provided directly
  const rawId = str(r.id ?? r.urn ?? r.entityUrn ?? r.activityId)
  const numericId = rawId.replace(/\D/g, '') || String(index)
  const fallbackUrl = numericId ? `https://www.linkedin.com/feed/update/urn:li:activity:${numericId}/` : null

  // Date: Apify may return a timestamp (ms), ISO string, or "X time ago" string
  const rawDate = r.postedAt ?? r.publishedAt ?? r.createdAt ?? r.date ?? r.postedDate ?? r.publishedDate ?? r.time
  let postedAt: string | null = null
  if (typeof rawDate === 'number') {
    postedAt = new Date(rawDate).toISOString()
  } else if (typeof rawDate === 'string' && rawDate.trim()) {
    postedAt = rawDate.trim()
  }

  return {
    id: rawId || `post-${index}`,
    text: str(r.text ?? r.content ?? r.commentary ?? r.description),
    url: str(r.url ?? r.postUrl ?? r.link ?? r.shareUrl ?? r.articleUrl) || fallbackUrl,
    postedAt,
    likesCount: num(r.likesCount ?? r.likes ?? r.numLikes ?? stats.numLikes ?? stats.likesCount ?? r.reactionCount ?? r.reactions),
    commentsCount: num(r.commentsCount ?? r.numComments ?? stats.numComments ?? stats.commentsCount ?? r.totalComments),
    repostsCount: num(r.repostsCount ?? r.reposts ?? r.numReposts ?? r.sharesCount ?? stats.numShares ?? stats.repostsCount ?? r.numShares),
    imageUrl,
    isRepost: Boolean(r.isRepost ?? r.repost ?? r.isShared ?? false),
    comments,
  }
}
