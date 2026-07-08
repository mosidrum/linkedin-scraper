'use client'

import { useState } from 'react'

interface Props {
  skills: string[]
}

const VISIBLE_COUNT = 8

export function SkillsSection({ skills }: Props) {
  const [showAll, setShowAll] = useState(false)
  if (!skills.length) return null

  const visible = showAll ? skills : skills.slice(0, VISIBLE_COUNT)
  const hasMore = skills.length > VISIBLE_COUNT

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#0A66C2] hover:bg-blue-100 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-medium text-[#0A66C2] hover:underline"
        >
          {showAll ? 'Show fewer skills' : `Show all ${skills.length} skills`}
        </button>
      )}
    </section>
  )
}
