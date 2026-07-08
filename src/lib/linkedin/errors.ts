import type { ProfileErrorCode } from './types'

export class LinkedInImportError extends Error {
  readonly code: ProfileErrorCode

  constructor(code: ProfileErrorCode, message: string) {
    super(message)
    this.name = 'LinkedInImportError'
    this.code = code
  }
}

export class PrivateProfileError extends LinkedInImportError {
  constructor(url: string) {
    super('PRIVATE_PROFILE', `Profile at ${url} is private and cannot be imported`)
  }
}

export class ProfileNotFoundError extends LinkedInImportError {
  constructor(url: string) {
    super('NOT_FOUND', `No profile found at ${url}`)
  }
}

export class RateLimitError extends LinkedInImportError {
  constructor() {
    super('RATE_LIMITED', 'Rate limit reached — please wait before retrying')
  }
}

export class ProviderError extends LinkedInImportError {
  constructor(detail?: string) {
    super('PROVIDER_ERROR', `Provider error${detail ? `: ${detail}` : ''}`)
  }
}

export class NetworkError extends LinkedInImportError {
  constructor(detail?: string) {
    super('NETWORK_ERROR', `Network error${detail ? `: ${detail}` : ''}`)
  }
}

export const USER_FACING_MESSAGES: Record<ProfileErrorCode, string> = {
  INVALID_URL: 'Please enter a valid LinkedIn profile URL.',
  PRIVATE_PROFILE: 'This profile is private and cannot be imported.',
  NOT_FOUND: 'Profile not found. Check the URL and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  PROVIDER_ERROR: 'Import failed due to a provider issue. Please try again later.',
  NETWORK_ERROR: 'Network error. Check your connection and try again.',
}
