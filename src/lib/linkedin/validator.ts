import type { ValidationResult } from './types'

const PERSONAL_PROFILE_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?(\?.*)?$/

type RejectRule = { pattern: RegExp; message: string }

const REJECT_RULES: RejectRule[] = [
  {
    pattern: /linkedin\.com\/company\//i,
    message: 'This looks like a company page, not a personal profile.',
  },
  {
    pattern: /linkedin\.com\/jobs\//i,
    message: 'This is a job posting URL, not a profile.',
  },
  {
    pattern: /linkedin\.com\/(feed|groups|events|learning)\//i,
    message: 'This URL does not point to a LinkedIn profile.',
  },
  {
    pattern: /linkedin\.com\/sales\/|sales-navigator/i,
    message: 'Sales Navigator URLs are not supported. Please use a standard linkedin.com/in/ URL.',
  },
  {
    pattern: /linkedin\.com\/recruiter\//i,
    message: 'Recruiter URLs are not supported. Please use a standard linkedin.com/in/ URL.',
  },
  {
    pattern: /lnkd\.in\//i,
    message:
      'Shortened LinkedIn URLs cannot be imported. Please paste the full profile URL (linkedin.com/in/username).',
  },
]

function normalizeUrl(raw: string): string {
  // Strip query string and trailing slash for clean canonical form
  const url = raw.trim().replace(/\?.*$/, '').replace(/\/$/, '')
  // Ensure https
  return url.replace(/^http:\/\//, 'https://')
}

export function validateLinkedInUrl(raw: string): ValidationResult {
  const trimmed = raw.trim()

  if (!trimmed) {
    return { valid: false, error: 'Please enter a LinkedIn profile URL.' }
  }

  // Check for obvious non-URLs
  // Run rejection rules first — they give specific messages (lnkd.in before the linkedin check)
  for (const rule of REJECT_RULES) {
    if (rule.pattern.test(trimmed)) {
      return { valid: false, error: rule.message }
    }
  }

  if (!trimmed.includes('linkedin')) {
    return { valid: false, error: 'Please enter a full LinkedIn profile URL (linkedin.com/in/username).' }
  }

  if (!PERSONAL_PROFILE_RE.test(trimmed)) {
    // Distinguish between malformed LinkedIn URLs and non-LinkedIn URLs
    if (/linkedin\.com/i.test(trimmed)) {
      return {
        valid: false,
        error: 'Invalid LinkedIn profile URL. Expected format: linkedin.com/in/username',
      }
    }
    return { valid: false, error: 'Please enter a full LinkedIn profile URL (linkedin.com/in/username).' }
  }

  return { valid: true, normalizedUrl: normalizeUrl(trimmed) }
}

export function extractPublicIdentifier(normalizedUrl: string): string {
  const match = normalizedUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/)
  return match ? match[1] : ''
}
