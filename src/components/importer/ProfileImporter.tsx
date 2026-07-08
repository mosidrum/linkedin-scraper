'use client'

import { useState } from 'react'
import { UrlInput } from './UrlInput'
import { ImportProgress } from './ImportProgress'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { LinkedInProfile, ImportState, ProfileErrorCode } from '@/lib/linkedin/types'

interface ImportError {
  code: ProfileErrorCode
  message: string
}

export function ProfileImporter() {
  const [importState, setImportState] = useState<ImportState>('idle')
  const [validUrl, setValidUrl] = useState<string | null>(null)
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [importError, setImportError] = useState<ImportError | null>(null)

  async function handleImport() {
    if (!validUrl || importState === 'importing') return

    setImportState('importing')
    setImportError(null)
    setProfile(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        const err = data?.error
        setImportError({
          code: err?.code ?? 'PROVIDER_ERROR',
          message: err?.message ?? 'Import failed',
        })
        setImportState('error')
        return
      }

      setProfile(data.profile)
      setImportState('success')
    } catch {
      setImportError({ code: 'NETWORK_ERROR', message: 'Network error' })
      setImportState('error')
    }
  }

  function reset() {
    setImportState('idle')
    setProfile(null)
    setImportError(null)
  }

  const isImporting = importState === 'importing'

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input bar — always visible */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">LinkedIn Profile Importer</h1>
        <p className="mb-5 text-sm text-gray-500">
          Paste a personal LinkedIn profile URL to import publicly available information.
        </p>

        <div className="flex gap-3 items-start flex-col sm:flex-row">
          <div className="flex-1 w-full">
            <UrlInput onValidChange={setValidUrl} disabled={isImporting} />
          </div>

          <button
            onClick={handleImport}
            disabled={!validUrl || isImporting}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isImporting ? (
              <>
                <LoadingSpinner size="sm" />
                Importing…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Import Profile
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Only publicly visible information is retrieved. No login required.
        </p>
      </div>

      {/* Progress */}
      {importState === 'importing' && (
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" />
            Fetching profile data… this may take a few seconds.
          </p>
          <ImportProgress />
        </div>
      )}

      {/* Error */}
      {importState === 'error' && importError && (
        <ErrorMessage code={importError.code} onRetry={reset} />
      )}

      {/* Success */}
      {importState === 'success' && profile && (
        <ProfileCard
          initialProfile={profile}
          onSave={(saved) => {
            console.log('Profile saved:', saved)
          }}
        />
      )}
    </div>
  )
}
