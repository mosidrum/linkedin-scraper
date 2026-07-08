'use client'

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

export function ImportProgress() {
  return (
    <div className="space-y-4" aria-label="Loading profile…">
      {/* Hero skeleton */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-36 w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
            <div className="flex-1 pt-14 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* About skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
        <Skeleton className="h-4 w-16 mb-3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* Experience skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-4 w-24 mb-2" />
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Skills skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-4 w-16 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[80, 60, 90, 70, 50, 75].map((w, i) => (
            <Skeleton key={i} className={`h-6 rounded-full`} style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
