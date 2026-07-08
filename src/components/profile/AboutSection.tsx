'use client'

import { EditableField } from './EditableField'

interface Props {
  about: string
  onChange: (v: string) => void
}

export function AboutSection({ about, onChange }: Props) {
  if (!about) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">About</h2>
      <EditableField
        value={about}
        onChange={onChange}
        multiline
        label="About"
        className="text-sm text-gray-600 leading-relaxed"
      />
    </section>
  )
}
