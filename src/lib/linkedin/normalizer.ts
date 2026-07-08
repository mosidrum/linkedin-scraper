import { extractPublicIdentifier } from './validator'
import type {
  LinkedInProfile,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  LanguageItem,
  VolunteerItem,
  ProjectItem,
  PublicationItem,
  HonorItem,
} from './types'

// Raw shape returned by harvestapi/linkedin-profile-scraper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function num(v: unknown): number | null {
  const n = Number(v)
  return isNaN(n) || v === null || v === undefined ? null : n
}

function dateStr(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'string') return v
  // Handle { year, month } objects
  if (typeof v === 'object' && v !== null) {
    const o = v as Raw
    const year = o.year ?? o.Year
    const month = o.month ?? o.Month
    if (year) return month ? `${year}-${String(month).padStart(2, '0')}` : String(year)
  }
  return null
}

function normalizeExperience(raw: Raw[]): ExperienceItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((e, i) => ({
    id: str(e.entityUrn ?? e.id) || `exp-${i}`,
    title: str(e.title ?? e.jobTitle ?? e.position),
    company: str(e.companyName ?? e.company ?? e.organizationName),
    companyLogoUrl: str(e.companyLogoUrl ?? e.logoUrl) || null,
    location: str(e.location) || null,
    startDate: dateStr(e.startDate ?? e.start),
    endDate: dateStr(e.endDate ?? e.end),
    current: Boolean(e.current ?? !e.endDate),
    description: str(e.description) || null,
  }))
}

function normalizeEducation(raw: Raw[]): EducationItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((e, i) => ({
    id: str(e.entityUrn ?? e.id) || `edu-${i}`,
    school: str(e.schoolName ?? e.school ?? e.institutionName),
    schoolLogoUrl: str(e.schoolLogoUrl ?? e.logoUrl) || null,
    degree: str(e.degreeName ?? e.degree) || null,
    field: str(e.fieldOfStudy ?? e.field) || null,
    startDate: dateStr(e.startDate ?? e.start),
    endDate: dateStr(e.endDate ?? e.end),
    description: str(e.description) || null,
  }))
}

function normalizeCertifications(raw: Raw[]): CertificationItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((c, i) => ({
    id: str(c.entityUrn ?? c.id) || `cert-${i}`,
    name: str(c.name ?? c.title),
    issuer: str(c.authority ?? c.issuer ?? c.issuingOrganization) || null,
    issueDate: dateStr(c.timePeriod?.startDate ?? c.issueDate ?? c.issued),
    expiryDate: dateStr(c.timePeriod?.endDate ?? c.expiryDate ?? c.expires),
    credentialId: str(c.licenseNumber ?? c.credentialId) || null,
    credentialUrl: str(c.url ?? c.credentialUrl) || null,
  }))
}

function normalizeLanguages(raw: Raw[]): LanguageItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((l) => ({
    name: str(l.name ?? l.language),
    proficiency: str(l.proficiency ?? l.level) || null,
  }))
}

function normalizeVolunteer(raw: Raw[]): VolunteerItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((v, i) => ({
    id: str(v.entityUrn ?? v.id) || `vol-${i}`,
    role: str(v.role ?? v.title ?? v.position),
    organization: str(v.companyName ?? v.organization ?? v.organizationName),
    cause: str(v.cause) || null,
    startDate: dateStr(v.startDate ?? v.start),
    endDate: dateStr(v.endDate ?? v.end),
    current: Boolean(v.current ?? !v.endDate),
    description: str(v.description) || null,
  }))
}

function normalizeProjects(raw: Raw[]): ProjectItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p, i) => ({
    id: str(p.entityUrn ?? p.id) || `proj-${i}`,
    title: str(p.title ?? p.name),
    description: str(p.description) || null,
    startDate: dateStr(p.startDate ?? p.start),
    endDate: dateStr(p.endDate ?? p.end),
    url: str(p.url) || null,
  }))
}

function normalizePublications(raw: Raw[]): PublicationItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p, i) => ({
    id: str(p.entityUrn ?? p.id) || `pub-${i}`,
    title: str(p.name ?? p.title),
    publisher: str(p.publisher) || null,
    publishDate: dateStr(p.date ?? p.publishDate),
    url: str(p.url) || null,
    description: str(p.description) || null,
  }))
}

function normalizeHonors(raw: Raw[]): HonorItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((h, i) => ({
    id: str(h.entityUrn ?? h.id) || `honor-${i}`,
    title: str(h.title ?? h.name),
    issuer: str(h.issuer ?? h.issueBy) || null,
    issueDate: dateStr(h.issueDate ?? h.date),
    description: str(h.description) || null,
  }))
}

function extractSkills(raw: Raw): string[] {
  const skills = raw.skills ?? raw.skillEndorsements ?? []
  if (!Array.isArray(skills)) return []
  return skills.map((s: Raw) => str(s.name ?? s.skill ?? s)).filter(Boolean)
}

function extractCurrentCompany(experience: ExperienceItem[]): string | null {
  const current = experience.find((e) => e.current)
  return current?.company ?? experience[0]?.company ?? null
}

export function normalizeProfile(raw: Raw, profileUrl: string, provider: string): LinkedInProfile {
  const publicIdentifier = str(raw.publicIdentifier ?? raw.username) || extractPublicIdentifier(profileUrl)
  const firstName = str(raw.firstName ?? raw.first_name)
  const lastName = str(raw.lastName ?? raw.last_name)
  const fullName = str(raw.fullName ?? raw.name) || [firstName, lastName].filter(Boolean).join(' ')

  const experience = normalizeExperience(raw.experience ?? raw.positions ?? raw.workExperience ?? [])

  return {
    url: profileUrl,
    publicIdentifier,
    fullName,
    firstName,
    lastName,
    headline: str(raw.headline ?? raw.title ?? raw.jobTitle),
    location: str(raw.location ?? raw.addressWithCountry ?? raw.geo?.full),
    about: str(raw.summary ?? raw.about ?? raw.description),
    avatarUrl: str(raw.profilePicture ?? raw.photoUrl ?? raw.avatar ?? raw.profilePictureUrl) || null,
    bannerUrl: str(raw.backgroundImage?.[0]?.url ?? raw.backgroundCoverImageUrl ?? raw.bannerUrl) || null,
    followerCount: num(raw.followersCount ?? raw.followerCount),
    connectionCount: num(raw.connectionsCount ?? raw.connectionCount),
    currentCompany: str(raw.currentCompany ?? raw.company) || extractCurrentCompany(experience),
    experience,
    education: normalizeEducation(raw.education ?? raw.educations ?? []),
    skills: extractSkills(raw),
    certifications: normalizeCertifications(raw.certifications ?? raw.licenses ?? []),
    languages: normalizeLanguages(raw.languages ?? []),
    volunteerWork: normalizeVolunteer(raw.volunteerExperiences ?? raw.volunteer ?? []),
    projects: normalizeProjects(raw.projects ?? []),
    publications: normalizePublications(raw.publications ?? []),
    honors: normalizeHonors(raw.honors ?? raw.honorsAwards ?? []),
    recommendationsCount: num(raw.recommendationsCount),
    importedAt: new Date().toISOString(),
    provider,
  }
}
