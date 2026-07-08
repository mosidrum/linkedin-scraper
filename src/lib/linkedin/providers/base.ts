import type { LinkedInProfile, ValidationResult } from '../types'

export interface ProfileProvider {
  readonly id: string
  readonly name: string
  validateUrl(url: string): ValidationResult
  fetchProfile(url: string): Promise<LinkedInProfile>
}
