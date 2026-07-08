'use client'

import type { EducationItem } from '@/lib/linkedin/types'

interface Props {
  education: EducationItem[]
}

export function EducationSection({ education }: Props) {
  if (!education.length) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Education</h2>
      <ul className="space-y-5">
        {education.map((item) => (
          <li key={item.id} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-lg font-bold">
              {item.school[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{item.school}</p>
              {(item.degree || item.field) && (
                <p className="text-sm text-gray-600">
                  {[item.degree, item.field].filter(Boolean).join(', ')}
                </p>
              )}
              {(item.startDate || item.endDate) && (
                <p className="text-xs text-gray-400">
                  {[item.startDate, item.endDate].filter(Boolean).join(' – ')}
                </p>
              )}
              {item.description && (
                <p className="mt-1 text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
