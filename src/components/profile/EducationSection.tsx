'use client'

import Image from 'next/image'
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
            <div className="shrink-0">
              {item.schoolLogoUrl ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Image src={item.schoolLogoUrl} alt={item.school} fill className="object-contain p-1" unoptimized />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-sm font-bold text-[#0A66C2]">
                  {item.school[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{item.school}</p>
              {(item.degree || item.field) && (
                <p className="text-sm text-gray-500">
                  {[item.degree, item.field].filter(Boolean).join(' · ')}
                </p>
              )}
              {(item.startDate || item.endDate) && (
                <p className="text-xs text-gray-400 mt-0.5">
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
