'use client'

import { useState, useEffect, useRef } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ValidationResult } from '@/lib/linkedin/types'

interface Props {
  onValidChange: (url: string | null) => void
  disabled?: boolean
}

type InputState = 'empty' | 'validating' | 'valid' | 'invalid'

export function UrlInput({ onValidChange, disabled = false }: Props) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<InputState>('empty')
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()

    if (!trimmed) {
      setState('empty')
      setError(null)
      onValidChange(null)
      return
    }

    setState('validating')

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        })
        const result: ValidationResult = await res.json()

        if (result.valid && result.normalizedUrl) {
          setState('valid')
          setError(null)
          onValidChange(result.normalizedUrl)
        } else {
          setState('invalid')
          setError(result.error ?? 'Invalid URL')
          onValidChange(null)
        }
      } catch {
        setState('invalid')
        setError('Could not validate URL. Check your connection.')
        onValidChange(null)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const borderClass =
    state === 'valid'
      ? 'border-green-400 focus:ring-green-300'
      : state === 'invalid'
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-300 focus:ring-blue-200'

  const textClass =
    state === 'valid'
      ? 'text-green-600'
      : state === 'invalid'
      ? 'text-red-600'
      : 'text-gray-900'

  return (
    <div className="w-full">
      <div className="relative">
        {/* LinkedIn icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </div>

        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text')
            setValue(pasted)
            e.preventDefault()
          }}
          placeholder="https://www.linkedin.com/in/username"
          disabled={disabled}
          aria-label="LinkedIn profile URL"
          aria-describedby={error ? 'url-error' : undefined}
          aria-invalid={state === 'invalid'}
          className={`w-full rounded-full border-2 bg-white py-3 pl-12 pr-12 text-sm font-medium placeholder-gray-400 shadow-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass} ${textClass}`}
        />

        {/* Right indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {state === 'validating' && <LoadingSpinner size="sm" />}
          {state === 'valid' && (
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {state === 'invalid' && (
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>

      {state === 'invalid' && error && (
        <p id="url-error" role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
