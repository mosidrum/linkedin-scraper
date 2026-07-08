'use client'

import { useState } from 'react'
import { ProfileHero } from './ProfileHero'
import { AboutSection } from './AboutSection'
import { ExperienceSection } from './ExperienceSection'
import { EducationSection } from './EducationSection'
import { SkillsSection } from './SkillsSection'
import { CertificationsSection } from './CertificationsSection'
import { ProjectsSection } from './ProjectsSection'
import { PostsSection } from './PostsSection'
import type { LinkedInProfile } from '@/lib/linkedin/types'

interface Props {
  initialProfile: LinkedInProfile
  onSave?: (profile: LinkedInProfile) => void
}

export function ProfileCard({ initialProfile, onSave }: Props) {
  const [profile, setProfile] = useState<LinkedInProfile>(initialProfile)
  const [saved, setSaved] = useState(false)

  function patch(updates: Partial<LinkedInProfile>) {
    setSaved(false)
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  function handleSave() {
    onSave?.(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Built by Isaac Ayodele with {profile.provider}
          {' '}·{' '}
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on LinkedIn ↗
          </a>
        </p>
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saved ? '✓ Saved' : 'Save Profile'}
        </button>
      </div>

      <ProfileHero profile={profile} onChange={patch} />
      <PostsSection profileUrl={profile.url} />
      <AboutSection about={profile.about} onChange={(v) => patch({ about: v })} />
      <ExperienceSection experience={profile.experience} />
      <EducationSection education={profile.education} />
      <SkillsSection skills={profile.skills} />
      <CertificationsSection certifications={profile.certifications} />
      <ProjectsSection projects={profile.projects} />

      {/* Supplementary compact sections */}
      {profile.languages.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Languages</h2>
          <ul className="space-y-1">
            {profile.languages.map((lang) => (
              <li key={lang.name} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800">{lang.name}</span>
                {lang.proficiency && <span className="text-gray-500 text-xs">{lang.proficiency}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.volunteerWork.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Volunteering</h2>
          <ul className="space-y-3">
            {profile.volunteerWork.map((v) => (
              <li key={v.id}>
                <p className="font-semibold text-sm text-gray-900">{v.role}</p>
                <p className="text-sm text-gray-600">{v.organization}</p>
                {v.cause && <p className="text-xs text-gray-400">{v.cause}</p>}
                {v.description && <p className="mt-1 text-xs text-gray-500">{v.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.honors.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Honors & Awards</h2>
          <ul className="space-y-3">
            {profile.honors.map((h) => (
              <li key={h.id}>
                <p className="font-semibold text-sm text-gray-900">{h.title}</p>
                {h.issuer && <p className="text-xs text-gray-600">{h.issuer}</p>}
                {h.issueDate && <p className="text-xs text-gray-400">{h.issueDate}</p>}
                {h.description && <p className="mt-1 text-xs text-gray-500">{h.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pb-8 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {saved ? '✓ Saved' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
