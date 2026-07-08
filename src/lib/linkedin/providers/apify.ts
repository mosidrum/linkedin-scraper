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
import type { LinkedInProfile, ValidationResult } from '../types'

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

  private async fetchDataset(datasetId: string): Promise<Record<string, unknown>[]> {
    const res = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?clean=true&limit=1`, {
      headers: { Authorization: `Bearer ${this.token}` },
    }).catch((err: Error) => { throw new NetworkError(err.message) })

    if (!res.ok) throw new ProviderError(`Failed to fetch dataset: ${res.status}`)
    return res.json()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
