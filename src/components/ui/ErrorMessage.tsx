'use client'

import { USER_FACING_MESSAGES } from '@/lib/linkedin/errors'
import type { ProfileErrorCode } from '@/lib/linkedin/types'

interface Props {
  code?: ProfileErrorCode
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ code, message, onRetry }: Props) {
  const text = code ? USER_FACING_MESSAGES[code] : message ?? 'An unexpected error occurred.'

  const icon =
    code === 'PRIVATE_PROFILE' ? '🔒'
    : code === 'NOT_FOUND' ? '🔍'
    : code === 'RATE_LIMITED' ? '⏱️'
    : '⚠️'

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
      <div className="mb-2 text-3xl">{icon}</div>
      <p className="text-sm font-medium text-red-800">{text}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
