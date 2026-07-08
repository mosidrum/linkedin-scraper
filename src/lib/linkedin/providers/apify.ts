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
    // Filter out comment/reaction feed items — they appear as separate dataset rows
    // with a ?commentUrn= or ?reactionUrn= query parameter in their LinkedIn URL
    const postItems = items.filter((raw) => {
      const url = String(raw.linkedinUrl ?? raw.shareLinkedinUrl ?? raw.url ?? '')
      return !url.includes('commentUrn=') && !url.includes('reactionUrn=')
    })
    return postItems.slice(0, maxPosts).map((raw, i) => normalizePost(raw, i))
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

function normalizeDate(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number' && v > 0) return new Date(v).toISOString()
  if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

function normalizePost(raw: Record<string, unknown>, index: number): PostItem {
  const r = raw as Record<string, unknown>
  const num = (v: unknown) => { const n = Number(v); return isNaN(n) || v === null || v === undefined ? null : n }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // engagement: { likes, comments, shares, reactions: [] }
  const eng = (r.engagement ?? {}) as Record<string, unknown>

  // postedAt is an object: { timestamp: ms, date: ISO string, postedAgoShort, postedAgoText }
  // or a plain string/number on some post types
  const rawPostedAt = r.postedAt ?? r.createdAt ?? r.createdAtTimestamp ?? r.date ?? r.publishedAt
  let postedAt: string | null = null
  if (rawPostedAt !== null && rawPostedAt !== undefined) {
    if (typeof rawPostedAt === 'object') {
      const o = rawPostedAt as Record<string, unknown>
      postedAt = normalizeDate(o.date ?? o.timestamp)
    } else {
      postedAt = normalizeDate(rawPostedAt)
    }
  }

  // Images: postImages array of { url } objects; also check postVideo thumbnail
  let imageUrl: string | null = null
  const postImages = r.postImages ?? r.images ?? r.media
  if (Array.isArray(postImages) && postImages.length > 0) {
    const first = postImages[0] as Record<string, unknown>
    imageUrl = str(first?.url ?? first?.src ?? first) || null
  } else if (r.postVideo) {
    const vid = r.postVideo as Record<string, unknown>
    imageUrl = str(vid.thumbnailUrl ?? vid.thumbnail) || null
  }

  // Comments array: { text/content/commentary, author: { name }, postedAt: { date, timestamp }, engagement: { likes } }
  const rawComments = r.comments ?? r.topComments ?? []
  const comments: PostComment[] = Array.isArray(rawComments)
    ? rawComments.map((c: Record<string, unknown>, ci: number) => {
        const cEng = (c.engagement ?? {}) as Record<string, unknown>
        const author = (c.author ?? c.actor ?? {}) as Record<string, unknown>
        const rawCDate = c.postedAt ?? c.createdAt ?? c.createdAtTimestamp ?? c.date
        let cPostedAt: string | null = null
        if (rawCDate !== null && rawCDate !== undefined) {
          if (typeof rawCDate === 'object') {
            const o = rawCDate as Record<string, unknown>
            cPostedAt = normalizeDate(o.date ?? o.timestamp)
          } else {
            cPostedAt = normalizeDate(rawCDate)
          }
        }
        return {
          id: str(c.id ?? c.urn ?? c.entityUrn ?? c.postId) || `comment-${index}-${ci}`,
          text: str(c.text ?? c.content ?? c.commentary ?? c.comment),
          authorName: str(author.name ?? author.fullName ?? c.authorName ?? c.commenterName) || null,
          postedAt: cPostedAt,
          likesCount: num(cEng.likes ?? c.likesCount ?? c.likes ?? c.numLikes),
        }
      })
    : []

  // URL: linkedinUrl is the canonical field; shareLinkedinUrl as fallback
  const rawId = str(r.id ?? r.postId ?? r.entityId ?? r.shareUrn)
  const directUrl = str(r.linkedinUrl ?? r.shareLinkedinUrl ?? r.url ?? r.postUrl)
  const url = directUrl || (rawId ? `https://www.linkedin.com/feed/update/urn:li:activity:${rawId}/` : null)

  return {
    id: rawId || `post-${index}`,
    text: str(r.content ?? r.commentary ?? r.text ?? r.description),
    url,
    postedAt,
    likesCount: num(eng.likes ?? r.likesCount ?? r.likes ?? r.numLikes ?? r.reactionCount),
    commentsCount: num(eng.comments ?? r.commentsCount ?? r.numComments ?? r.totalComments),
    repostsCount: num(eng.shares ?? r.repostsCount ?? r.sharesCount ?? r.numShares ?? r.reposts),
    imageUrl,
    isRepost: Boolean(r.isRepost ?? r.repost ?? r.contributed ?? false),
    comments,
  }
}
