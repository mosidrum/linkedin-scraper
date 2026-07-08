'use client'

import Image from 'next/image'
import { EditableField } from './EditableField'
import type { LinkedInProfile } from '@/lib/linkedin/types'

interface Props {
  profile: LinkedInProfile
  onChange: (updates: Partial<LinkedInProfile>) => void
}

export function ProfileHero({ profile, onChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Banner */}
      <div className="relative h-36 w-full bg-gradient-to-r from-blue-600 to-blue-800">
        {profile.bannerUrl && (
          <Image src={profile.bannerUrl} alt="Profile banner" fill className="object-cover" unoptimized />
        )}
      </div>

      {/* Avatar + core info */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-12 mb-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={profile.fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-gray-500">
                {(profile.firstName?.[0] ?? profile.fullName[0] ?? '?').toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5 pt-14 min-w-0 flex-1">
            <div className="text-xl font-bold text-gray-900 leading-tight">
              <EditableField
                value={profile.fullName}
                onChange={(v) => onChange({ fullName: v })}
                label="Full name"
                className="font-bold text-xl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-gray-700">
            <EditableField
              value={profile.headline}
              onChange={(v) => onChange({ headline: v })}
              placeholder="Add a headline"
              label="Headline"
              className="text-gray-700"
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

          <div className="flex flex-wrap gap-3 pt-1 text-sm text-gray-500">
            {profile.followerCount !== null && (
              <span className="font-medium text-gray-700">{profile.followerCount.toLocaleString()} followers</span>
            )}
            {profile.connectionCount !== null && (
              <span>{profile.connectionCount >= 500 ? '500+' : profile.connectionCount} connections</span>
            )}
            {profile.recommendationsCount !== null && profile.recommendationsCount > 0 && (
              <span>{profile.recommendationsCount} recommendation{profile.recommendationsCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
