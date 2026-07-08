'use client'

import { Badge } from '@/components/ui/Badge'

interface Props {
  skills: string[]
}

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="blue">{skill}</Badge>
        ))}
      </div>
    </section>
  )
}
