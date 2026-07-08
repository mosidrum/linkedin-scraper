'use client'

import { useState } from 'react'
import { UrlInput } from './UrlInput'
import { ImportProgress } from './ImportProgress'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { PostsSection } from '@/components/profile/PostsSection'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { LinkedInProfile, ImportState, ProfileErrorCode } from '@/lib/linkedin/types'

interface ImportError {
  code: ProfileErrorCode
  message: string
}

type Tab = 'profile' | 'posts'

export function ProfileImporter() {
  const [importState, setImportState] = useState<ImportState>('idle')
  const [validUrl, setValidUrl] = useState<string | null>(null)
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [importError, setImportError] = useState<ImportError | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  async function handleImport() {
    if (!validUrl || importState === 'importing') return

    setImportState('importing')
    setImportError(null)
    setProfile(null)
    setActiveTab('profile')

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

      const imported: LinkedInProfile = data.profile
      setProfile(imported)
      setImportState('success')

      // Log full profile data to console
      console.group(`LinkedIn Scrapper — ${imported.fullName} (@${imported.publicIdentifier})`)
      console.log('Profile URL:', imported.url)
      console.log('Provider:', imported.provider)
      console.log('Imported at:', imported.importedAt)
      console.log('Full name:', imported.fullName)
      console.log('Headline:', imported.headline)
      console.log('Location:', imported.location)
      console.log('About:', imported.about)
      console.log('Followers:', imported.followerCount)
      console.log('Connections:', imported.connectionCount)
      console.log('Current company:', imported.currentCompany)
      console.log('Experience:', imported.experience)
      console.log('Education:', imported.education)
      console.log('Skills:', imported.skills)
      console.log('Certifications:', imported.certifications)
      console.log('Languages:', imported.languages)
      console.log('Volunteer work:', imported.volunteerWork)
      console.log('Projects:', imported.projects)
      console.log('Publications:', imported.publications)
      console.log('Honors:', imported.honors)
      console.log('Recommendations count:', imported.recommendationsCount)
      console.log('Avatar URL:', imported.avatarUrl)
      console.log('Banner URL:', imported.bannerUrl)
      console.log('Full profile object:', imported)
      console.groupEnd()
    } catch {
      setImportError({ code: 'NETWORK_ERROR', message: 'Network error' })
      setImportState('error')
    }
  }

  function reset() {
    setImportState('idle')
    setProfile(null)
    setImportError(null)
    setActiveTab('profile')
  }

  const isImporting = importState === 'importing'
  const showTabs = importState === 'success' && profile

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">LinkedIn Scrapper</h1>
        <p className="mb-5 text-sm text-gray-500">
          Paste a personal LinkedIn profile URL to scrape publicly available information.
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
                Scraping…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Scrape Profile
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
            Scraping profile data… this may take a few seconds.
          </p>
          <ImportProgress />
        </div>
      )}

      {/* Error */}
      {importState === 'error' && importError && (
        <ErrorMessage code={importError.code} onRetry={reset} />
      )}

      {/* Tabs + content */}
      {showTabs && (
        <div className="space-y-4">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts &amp; Comments
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'profile' && (
            <ProfileCard
              initialProfile={profile}
              onSave={(saved) => {
                console.log('Profile saved:', saved)
              }}
            />
          )}

          {activeTab === 'posts' && (
            <PostsSection profileUrl={profile.url} />
          )}
        </div>
      )}
    </div>
  )
}
