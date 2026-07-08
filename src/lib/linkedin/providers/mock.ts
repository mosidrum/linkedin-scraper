import { validateLinkedInUrl, extractPublicIdentifier } from '../validator'
import type { ProfileProvider } from './base'
import type { LinkedInProfile, ValidationResult } from '../types'

const MOCK_PROFILE_TEMPLATE: Omit<
  LinkedInProfile,
  'url' | 'publicIdentifier' | 'importedAt' | 'provider'
> = {
  fullName: 'Alex Morgan',
  firstName: 'Alex',
  lastName: 'Morgan',
  headline: 'Senior Software Engineer at Acme Corp | Open Source Enthusiast',
  location: 'San Francisco Bay Area',
  about:
    'Passionate software engineer with 8+ years building scalable distributed systems. I love contributing to open source and mentoring junior engineers. Currently focused on developer tooling and platform engineering.',
  avatarUrl: 'https://i.pravatar.cc/300?img=12',
  bannerUrl: null,
  followerCount: 1420,
  connectionCount: 500,
  currentCompany: 'Acme Corp',
  experience: [
    {
      id: 'exp-0',
      title: 'Senior Software Engineer',
      company: 'Acme Corp',
      companyLogoUrl: null,
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: null,
      current: true,
      description:
        'Led migration of monolith to microservices architecture, reducing deploy time by 60%. Mentored team of 5 engineers.',
    },
    {
      id: 'exp-1',
      title: 'Software Engineer II',
      company: 'TechStartup Inc',
      companyLogoUrl: null,
      location: 'Remote',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description: 'Built real-time analytics pipeline processing 2M events/day using Kafka and Spark.',
    },
    {
      id: 'exp-2',
      title: 'Junior Software Engineer',
      company: 'DevAgency LLC',
      companyLogoUrl: null,
      location: 'New York, NY',
      startDate: '2016-08',
      endDate: '2018-05',
      current: false,
      description: 'Full-stack development for client projects using React and Node.js.',
    },
  ],
  education: [
    {
      id: 'edu-0',
      school: 'University of California, Berkeley',
      schoolLogoUrl: null,
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012',
      endDate: '2016',
      description: 'GPA: 3.8/4.0 — Dean\'s List all semesters.',
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Go',
    'Kubernetes',
    'PostgreSQL',
    'Redis',
    'AWS',
    'System Design',
    'Technical Leadership',
  ],
  certifications: [
    {
      id: 'cert-0',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
      expiryDate: '2026-04',
      credentialId: 'AWS-SAP-123456',
      credentialUrl: null,
    },
  ],
  languages: [
    { name: 'English', proficiency: 'Native or bilingual proficiency' },
    { name: 'Spanish', proficiency: 'Professional working proficiency' },
  ],
  volunteerWork: [
    {
      id: 'vol-0',
      role: 'Coding Instructor',
      organization: 'Code for Good',
      cause: 'Education',
      startDate: '2020-01',
      endDate: null,
      current: true,
      description: 'Teaching intro programming to underserved high school students on weekends.',
    },
  ],
  projects: [
    {
      id: 'proj-0',
      title: 'OpenTrace',
      description:
        'Open-source distributed tracing library for Node.js with 1.2k GitHub stars. Supports OpenTelemetry spec.',
      startDate: '2022-01',
      endDate: null,
      url: 'https://github.com/alexmorgan/opentrace',
    },
  ],
  publications: [],
  honors: [
    {
      id: 'honor-0',
      title: 'Hackathon Winner — Best Developer Tool',
      issuer: 'SF TechWeek',
      issueDate: '2023-09',
      description: 'First place out of 120 teams for building a real-time code collaboration tool.',
    },
  ],
  recommendationsCount: 7,
}

export class MockProvider implements ProfileProvider {
  readonly id = 'mock'
  readonly name = 'Mock Provider (Development)'

  validateUrl(url: string): ValidationResult {
    return validateLinkedInUrl(url)
  }

  async fetchProfile(url: string): Promise<LinkedInProfile> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const result = validateLinkedInUrl(url)
    if (!result.valid || !result.normalizedUrl) {
      throw new Error(result.error ?? 'Invalid URL')
    }

    const publicIdentifier = extractPublicIdentifier(result.normalizedUrl)

    return {
      ...MOCK_PROFILE_TEMPLATE,
      url: result.normalizedUrl,
      publicIdentifier,
      importedAt: new Date().toISOString(),
      provider: this.id,
    }
  }
}
