'use client'

import Image from 'next/image'
import { EditableField } from './EditableField'
import type { LinkedInProfile } from '@/lib/linkedin/types'

interface Props {
  profile: LinkedInProfile
  onChange: (updates: Partial<LinkedInProfile>) => void
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return n.toLocaleString()
}

export function ProfileHero({ profile, onChange }: Props) {
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join('') || profile.fullName[0]?.toUpperCase() || '?'

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-[#0A66C2] to-[#004182]">
        {profile.bannerUrl && (
          <Image src={profile.bannerUrl} alt="Profile banner" fill className="object-cover" unoptimized />
        )}
        {/* LinkedIn link button top-right */}
        <a
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          View on LinkedIn ↗
        </a>
      </div>

      {/* Avatar + core info */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#0A66C2] to-[#004182] shadow-lg">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={profile.fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-2xl font-bold text-gray-900 leading-tight">
            <EditableField
              value={profile.fullName}
              onChange={(v) => onChange({ fullName: v })}
              label="Full name"
              className="font-bold text-2xl"
            />
          </div>

          <div className="text-gray-600">
            <EditableField
              value={profile.headline}
              onChange={(v) => onChange({ headline: v })}
              placeholder="Add a headline"
              label="Headline"
              className="text-gray-600"
            />
          </div>

          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <EditableField
                value={profile.location}
                onChange={(v) => onChange({ location: v })}
                label="Location"
                className="text-sm text-gray-500"
              />
            </div>
          )}

          {/* Stats pills */}
          {(profile.followerCount !== null || profile.connectionCount !== null || (profile.recommendationsCount !== null && profile.recommendationsCount > 0)) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.followerCount !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-[#0A66C2]">
                  {formatCount(profile.followerCount)} followers
                </span>
              )}
              {profile.connectionCount !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                  {profile.connectionCount >= 500 ? '500+' : profile.connectionCount} connections
                </span>
              )}
              {profile.recommendationsCount !== null && profile.recommendationsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  ★ {profile.recommendationsCount} recommendation{profile.recommendationsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
