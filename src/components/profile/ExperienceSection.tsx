'use client'

import Image from 'next/image'
import type { ExperienceItem } from '@/lib/linkedin/types'

interface Props {
  experience: ExperienceItem[]
}

function formatDateRange(start: string | null, end: string | null, current: boolean): string {
  const fmt = (d: string | null) => {
    if (!d) return ''
    const [year, month] = d.split('-')
    if (!month) return year
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  const s = fmt(start)
  const e = current ? 'Present' : fmt(end)
  if (!s && !e) return ''
  if (!s) return e
  if (!e) return s
  return `${s} – ${e}`
}

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Experience</h2>
      <ul className="space-y-5">
        {experience.map((item) => (
          <li key={item.id} className="flex gap-4">
            <div className="shrink-0">
              {item.companyLogoUrl ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Image src={item.companyLogoUrl} alt={item.company} fill className="object-contain p-1" unoptimized />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-sm font-bold text-[#0A66C2]">
                  {item.company?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-snug">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.company}</p>
                  {item.location && <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  {item.current && (
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                      Current
                    </span>
                  )}
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDateRange(item.startDate, item.endDate, item.current)}
                  </p>
                </div>
              </div>
              {item.description && (
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
