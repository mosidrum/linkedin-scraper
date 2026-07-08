'use client'

import type { ProjectItem } from '@/lib/linkedin/types'

interface Props {
  projects: ProjectItem[]
}

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Projects</h2>
      <ul className="space-y-4">
        {projects.map((proj) => (
          <li key={proj.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{proj.title}</p>
                {(proj.startDate || proj.endDate) && (
                  <p className="text-xs text-gray-400">
                    {[proj.startDate, proj.endDate ?? 'Present'].filter(Boolean).join(' – ')}
                  </p>
                )}
              </div>
              {proj.url && (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-blue-600 hover:underline"
                >
                  View →
                </a>
              )}
            </div>
            {proj.description && (
              <p className="mt-1 text-sm text-gray-500">{proj.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
