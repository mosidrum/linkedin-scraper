import type { LinkedInProfile } from './types'

const TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  profile: LinkedInProfile
  expiresAt: number
}

const store = new Map<string, CacheEntry>()

export const profileCache = {
  get(normalizedUrl: string): LinkedInProfile | null {
    const entry = store.get(normalizedUrl)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(normalizedUrl)
      return null
    }
    return entry.profile
  },

  set(normalizedUrl: string, profile: LinkedInProfile): void {
    store.set(normalizedUrl, { profile, expiresAt: Date.now() + TTL_MS })
  },

  delete(normalizedUrl: string): void {
    store.delete(normalizedUrl)
  },

  clear(): void {
    store.clear()
  },
}
