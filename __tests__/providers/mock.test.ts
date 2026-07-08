import { MockProvider } from '@/lib/linkedin/providers/mock'

const provider = new MockProvider()

describe('MockProvider', () => {
  it('has correct id and name', () => {
    expect(provider.id).toBe('mock')
    expect(provider.name).toBeTruthy()
  })

  describe('validateUrl', () => {
    it('accepts valid LinkedIn profile URLs', () => {
      const result = provider.validateUrl('https://linkedin.com/in/johndoe')
      expect(result.valid).toBe(true)
      expect(result.normalizedUrl).toBeDefined()
    })

    it('rejects company pages', () => {
      const result = provider.validateUrl('https://linkedin.com/company/microsoft')
      expect(result.valid).toBe(false)
    })

    it('rejects empty string', () => {
      const result = provider.validateUrl('')
      expect(result.valid).toBe(false)
    })
  })

  describe('fetchProfile', () => {
    it('returns a valid LinkedInProfile for a valid URL', async () => {
      const url = 'https://linkedin.com/in/testuser'
      const profile = await provider.fetchProfile(url)

      expect(profile.url).toBe(url)
      expect(profile.publicIdentifier).toBe('testuser')
      expect(profile.fullName).toBeTruthy()
      expect(profile.provider).toBe('mock')
      expect(profile.importedAt).toBeTruthy()
      expect(Array.isArray(profile.experience)).toBe(true)
      expect(Array.isArray(profile.education)).toBe(true)
      expect(Array.isArray(profile.skills)).toBe(true)
    }, 5000)

    it('throws for invalid URL', async () => {
      await expect(provider.fetchProfile('not-a-url')).rejects.toThrow()
    })
  })
})
