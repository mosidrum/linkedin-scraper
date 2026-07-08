import { normalizeProfile } from '@/lib/linkedin/normalizer'

const APIFY_FIXTURE = {
  publicIdentifier: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  headline: 'Software Engineer',
  location: 'New York, NY',
  summary: 'Experienced engineer with a passion for open source.',
  profilePicture: 'https://example.com/avatar.jpg',
  backgroundImage: [{ url: 'https://example.com/banner.jpg' }],
  followersCount: 1200,
  connectionsCount: 500,
  experience: [
    {
      entityUrn: 'exp-abc',
      title: 'Senior Engineer',
      companyName: 'Acme Corp',
      location: 'New York',
      startDate: { year: 2020, month: 3 },
      endDate: null,
      current: true,
      description: 'Led platform team.',
    },
  ],
  education: [
    {
      entityUrn: 'edu-xyz',
      schoolName: 'MIT',
      degreeName: 'BS',
      fieldOfStudy: 'Computer Science',
      startDate: { year: 2012 },
      endDate: { year: 2016 },
    },
  ],
  skills: [{ name: 'TypeScript' }, { name: 'React' }],
  certifications: [
    {
      entityUrn: 'cert-1',
      name: 'AWS SAP',
      authority: 'Amazon',
      timePeriod: { startDate: { year: 2023, month: 4 } },
      licenseNumber: 'AWS-123',
    },
  ],
  languages: [{ name: 'English', proficiency: 'Native' }],
  volunteerExperiences: [],
  projects: [
    {
      entityUrn: 'proj-1',
      title: 'OpenLib',
      description: 'An open source library.',
      url: 'https://github.com/johndoe/openlib',
    },
  ],
  publications: [],
  honors: [
    {
      entityUrn: 'honor-1',
      title: 'Hackathon Winner',
      issuer: 'TechFest',
      issueDate: { year: 2022 },
    },
  ],
  recommendationsCount: 5,
}

describe('normalizeProfile', () => {
  const url = 'https://linkedin.com/in/johndoe'
  const profile = normalizeProfile(APIFY_FIXTURE, url, 'apify')

  it('maps top-level identity fields', () => {
    expect(profile.publicIdentifier).toBe('johndoe')
    expect(profile.firstName).toBe('John')
    expect(profile.lastName).toBe('Doe')
    expect(profile.fullName).toBe('John Doe')
    expect(profile.headline).toBe('Software Engineer')
    expect(profile.location).toBe('New York, NY')
    expect(profile.about).toBe('Experienced engineer with a passion for open source.')
  })

  it('maps media URLs', () => {
    expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg')
    expect(profile.bannerUrl).toBe('https://example.com/banner.jpg')
  })

  it('maps social counts', () => {
    expect(profile.followerCount).toBe(1200)
    expect(profile.connectionCount).toBe(500)
  })

  it('normalizes experience', () => {
    expect(profile.experience).toHaveLength(1)
    const exp = profile.experience[0]
    expect(exp.title).toBe('Senior Engineer')
    expect(exp.company).toBe('Acme Corp')
    expect(exp.current).toBe(true)
    expect(exp.startDate).toBe('2020-03')
  })

  it('normalizes education', () => {
    expect(profile.education).toHaveLength(1)
    const edu = profile.education[0]
    expect(edu.school).toBe('MIT')
    expect(edu.degree).toBe('BS')
    expect(edu.field).toBe('Computer Science')
  })

  it('extracts skills as string array', () => {
    expect(profile.skills).toEqual(['TypeScript', 'React'])
  })

  it('normalizes certifications', () => {
    expect(profile.certifications).toHaveLength(1)
    expect(profile.certifications[0].name).toBe('AWS SAP')
    expect(profile.certifications[0].issuer).toBe('Amazon')
  })

  it('normalizes projects', () => {
    expect(profile.projects).toHaveLength(1)
    expect(profile.projects[0].title).toBe('OpenLib')
    expect(profile.projects[0].url).toBe('https://github.com/johndoe/openlib')
  })

  it('normalizes honors', () => {
    expect(profile.honors).toHaveLength(1)
    expect(profile.honors[0].title).toBe('Hackathon Winner')
  })

  it('sets provider and importedAt', () => {
    expect(profile.provider).toBe('apify')
    expect(profile.importedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('sets url from input', () => {
    expect(profile.url).toBe(url)
  })

  it('handles empty arrays gracefully', () => {
    const minimal = normalizeProfile({ firstName: 'Jane', lastName: 'Smith' }, url, 'mock')
    expect(minimal.experience).toEqual([])
    expect(minimal.education).toEqual([])
    expect(minimal.skills).toEqual([])
  })
})
