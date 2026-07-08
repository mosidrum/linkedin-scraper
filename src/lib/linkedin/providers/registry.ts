import type { ProfileProvider } from './base'
import { ApifyProvider } from './apify'
import { MockProvider } from './mock'

const registry = new Map<string, ProfileProvider>()

// Built-in providers
registry.set('mock', new MockProvider())

if (process.env.APIFY_TOKEN) {
  registry.set('apify', new ApifyProvider(process.env.APIFY_TOKEN))
}

export function getProvider(id?: string): ProfileProvider {
  const preferredId = id ?? (process.env.APIFY_TOKEN ? 'apify' : 'mock')
  const provider = registry.get(preferredId)

  if (!provider) {
    // Fall back to mock rather than crashing
    return registry.get('mock')!
  }

  return provider
}

export function registerProvider(provider: ProfileProvider): void {
  registry.set(provider.id, provider)
}

export function listProviders(): string[] {
  return [...registry.keys()]
}
