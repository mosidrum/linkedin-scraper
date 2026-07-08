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
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200/80">
        <div className="bg-gradient-to-br from-[#0A66C2] via-[#0077B5] to-[#004182] px-6 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">LinkedIn Scrapper</h1>
              <p className="text-blue-200 text-xs mt-0.5">Public profile data extractor</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start flex-col sm:flex-row">
            <div className="flex-1 w-full">
              <UrlInput onValidChange={setValidUrl} disabled={isImporting} />
            </div>
            <button
              onClick={handleImport}
              disabled={!validUrl || isImporting}
              className="shrink-0 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0A66C2] shadow hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isImporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Scraping…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Scrape Profile
                </>
              )}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-blue-200/80">
            Only publicly visible information is retrieved. No login required.
          </p>
        </div>
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
          {/* Pill tab bar */}
          <div className="flex gap-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#0A66C2] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                activeTab === 'posts'
                  ? 'bg-[#0A66C2] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts &amp; Comments
            </button>
          </div>

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
