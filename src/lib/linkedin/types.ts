export interface ExperienceItem {
  id: string
  title: string
  company: string
  companyLogoUrl: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  current: boolean
  description: string | null
}

export interface EducationItem {
  id: string
  school: string
  schoolLogoUrl: string | null
  degree: string | null
  field: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string | null
  issueDate: string | null
  expiryDate: string | null
  credentialId: string | null
  credentialUrl: string | null
}

export interface LanguageItem {
  name: string
  proficiency: string | null
}

export interface VolunteerItem {
  id: string
  role: string
  organization: string
  cause: string | null
  startDate: string | null
  endDate: string | null
  current: boolean
  description: string | null
}

export interface ProjectItem {
  id: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  url: string | null
}

export interface PublicationItem {
  id: string
  title: string
  publisher: string | null
  publishDate: string | null
  url: string | null
  description: string | null
}

export interface HonorItem {
  id: string
  title: string
  issuer: string | null
  issueDate: string | null
  description: string | null
}

export interface LinkedInProfile {
  url: string
  publicIdentifier: string
  fullName: string
  firstName: string
  lastName: string
  headline: string
  location: string
  about: string
  avatarUrl: string | null
  bannerUrl: string | null
  followerCount: number | null
  connectionCount: number | null
  currentCompany: string | null
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: string[]
  certifications: CertificationItem[]
  languages: LanguageItem[]
  volunteerWork: VolunteerItem[]
  projects: ProjectItem[]
  publications: PublicationItem[]
  honors: HonorItem[]
  recommendationsCount: number | null
  importedAt: string
  provider: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
  normalizedUrl?: string
}

export type ImportState = 'idle' | 'validating' | 'importing' | 'success' | 'error'

export type ProfileErrorCode =
  | 'INVALID_URL'
  | 'PRIVATE_PROFILE'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'

export interface ProfileError {
  code: ProfileErrorCode
  message: string
}
