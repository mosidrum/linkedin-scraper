'use client'

import type { ExperienceItem } from '@/lib/linkedin/types'
import { Badge } from '@/components/ui/Badge'

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
      <ol className="relative border-l border-gray-200 space-y-6 pl-6">
        {experience.map((item) => (
          <li key={item.id} className="relative">
            <div className="absolute -left-[1.625rem] top-1 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-sm text-gray-600">{item.company}</p>
                {item.location && <p className="text-xs text-gray-400">{item.location}</p>}
              </div>
              <div className="shrink-0 text-right">
                {item.current && <Badge variant="blue">Current</Badge>}
                <p className="mt-1 text-xs text-gray-400 whitespace-nowrap">
                  {formatDateRange(item.startDate, item.endDate, item.current)}
                </p>
              </div>
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.description}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
