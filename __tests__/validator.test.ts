import { validateLinkedInUrl } from '@/lib/linkedin/validator'

describe('validateLinkedInUrl', () => {
  // Valid URLs
  const validCases = [
    'https://linkedin.com/in/johndoe',
    'https://www.linkedin.com/in/johndoe',
    'http://linkedin.com/in/johndoe',
    'https://www.linkedin.com/in/johndoe/',
    'https://linkedin.com/in/john-doe',
    'https://linkedin.com/in/john_doe',
    'https://linkedin.com/in/user123',
    'https://www.linkedin.com/in/satyanadella',
    'https://www.linkedin.com/in/bill-gates',
    'https://linkedin.com/in/user?trk=nav_responsive_tab_profile_pic', // with query string
  ]

  test.each(validCases)('accepts %s', (url) => {
    const result = validateLinkedInUrl(url)
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  // Company pages
  test.each([
    'https://linkedin.com/company/microsoft',
    'https://www.linkedin.com/company/google',
  ])('rejects company page: %s', (url) => {
    const result = validateLinkedInUrl(url)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/company page/i)
  })

  // Jobs
  test.each([
    'https://linkedin.com/jobs/view/12345',
    'https://www.linkedin.com/jobs/search/?keywords=engineer',
  ])('rejects job URL: %s', (url) => {
    const result = validateLinkedInUrl(url)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/job/i)
  })

  // Feed / groups / events / learning
  test.each([
    'https://linkedin.com/feed/',
    'https://linkedin.com/groups/12345',
    'https://linkedin.com/events/12345',
    'https://linkedin.com/learning/course',
  ])('rejects non-profile page: %s', (url) => {
    const result = validateLinkedInUrl(url)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/does not point to a LinkedIn profile/i)
  })

  // Sales Navigator
  test.each([
    'https://linkedin.com/sales/people/123',
    'https://linkedin.com/sales-navigator/lead/123',
  ])('rejects Sales Navigator: %s', (url) => {
    const result = validateLinkedInUrl(url)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/Sales Navigator/i)
  })

  // Short links
  it('rejects shortened links', () => {
    const result = validateLinkedInUrl('https://lnkd.in/abc123')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/shortened/i)
  })

  // Empty / garbage
  it('rejects empty string', () => {
    expect(validateLinkedInUrl('').valid).toBe(false)
  })

  it('rejects non-linkedin URL', () => {
    expect(validateLinkedInUrl('https://github.com/user').valid).toBe(false)
  })

  it('rejects plain text', () => {
    expect(validateLinkedInUrl('johndoe').valid).toBe(false)
  })

  // Normalisation
  it('normalizes http to https', () => {
    const result = validateLinkedInUrl('http://linkedin.com/in/johndoe')
    expect(result.normalizedUrl).toBe('https://linkedin.com/in/johndoe')
  })

  it('strips trailing slash', () => {
    const result = validateLinkedInUrl('https://linkedin.com/in/johndoe/')
    expect(result.normalizedUrl).toBe('https://linkedin.com/in/johndoe')
  })

  it('strips query string from normalizedUrl', () => {
    const result = validateLinkedInUrl('https://linkedin.com/in/johndoe?trk=nav')
    expect(result.normalizedUrl).toBe('https://linkedin.com/in/johndoe')
  })
})
