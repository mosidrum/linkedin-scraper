'use client'

import type { CertificationItem } from '@/lib/linkedin/types'
import { Badge } from '@/components/ui/Badge'

interface Props {
  certifications: CertificationItem[]
}

export function CertificationsSection({ certifications }: Props) {
  if (!certifications.length) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Licences & Certifications</h2>
      <ul className="space-y-4">
        {certifications.map((cert) => (
          <li key={cert.id} className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{cert.name}</p>
              {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
              {cert.issueDate && (
                <p className="text-xs text-gray-400">
                  Issued {cert.issueDate}{cert.expiryDate ? ` · Expires ${cert.expiryDate}` : ''}
                </p>
              )}
              {cert.credentialId && (
                <p className="text-xs text-gray-400">Credential ID: {cert.credentialId}</p>
              )}
            </div>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Badge variant="green">Verify</Badge>
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
