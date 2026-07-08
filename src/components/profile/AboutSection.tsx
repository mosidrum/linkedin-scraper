'use client'

import { useState } from 'react'
import { EditableField } from './EditableField'

interface Props {
  about: string
  onChange: (v: string) => void
}

export function AboutSection({ about, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!about) return null

  const lines = about.split('\n')
  const isLong = lines.length > 3 || about.length > 300

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">About</h2>
      <div className="border-l-4 border-[#0A66C2] pl-4">
        {expanded || !isLong ? (
          <EditableField
            value={about}
            onChange={onChange}
            multiline
            label="About"
            className="text-sm text-gray-600 leading-relaxed"
          />
        ) : (
          <>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{about}</p>
          </>
        )}
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 text-xs font-medium text-[#0A66C2] hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </section>
  )
}
