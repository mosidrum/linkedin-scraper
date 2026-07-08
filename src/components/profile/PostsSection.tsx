'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { PostItem } from '@/lib/linkedin/types'

interface Props {
  profileUrl: string
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function formatCount(n: number | null): string {
  if (n === null) return ''
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function PostCard({ post }: { post: PostItem }) {
  const [expanded, setExpanded] = useState(false)
  const TRUNCATE_AT = 280
  const isLong = post.text.length > TRUNCATE_AT
  const displayText = isLong && !expanded ? post.text.slice(0, TRUNCATE_AT) + '…' : post.text

  return (
    <article className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {post.isRepost && (
            <span className="text-xs text-gray-400 font-medium">↩ Repost</span>
          )}
          {post.postedAt && (
            <span className="text-xs text-gray-400">{formatRelativeDate(post.postedAt)}</span>
          )}
        </div>
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            View ↗
          </a>
        )}
      </div>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt="Post image"
          className="w-full rounded-lg object-cover max-h-64"
        />
      )}

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{displayText}</p>

      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-blue-600 hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Engagement row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 border-t border-gray-200">
        {post.likesCount !== null && (
          <span className="flex items-center gap-1">
            <span>👍</span> {formatCount(post.likesCount)}
          </span>
        )}
        {post.commentsCount !== null && (
          <span className="flex items-center gap-1">
            <span>💬</span> {formatCount(post.commentsCount)}
          </span>
        )}
        {post.repostsCount !== null && (
          <span className="flex items-center gap-1">
            <span>🔁</span> {formatCount(post.repostsCount)}
          </span>
        )}
      </div>
    </article>
  )
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

export function PostsSection({ profileUrl }: Props) {
  const [state, setState] = useState<LoadState>('idle')
  const [posts, setPosts] = useState<PostItem[]>([])
  const [error, setError] = useState<string | null>(null)

  async function loadPosts() {
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: profileUrl, maxPosts: 10 }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error?.message ?? 'Failed to load posts')
        setState('error')
        return
      }

      setPosts(data.posts ?? [])
      setState('loaded')
    } catch {
      setError('Network error loading posts')
      setState('error')
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Posts</h2>
        {state === 'loaded' && posts.length > 0 && (
          <span className="text-xs text-gray-400">{posts.length} most recent</span>
        )}
      </div>

      {state === 'idle' && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-4">Load recent posts from this profile.</p>
          <button
            onClick={loadPosts}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Load Posts
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-gray-500">
          <LoadingSpinner size="md" />
          <p className="text-sm">Fetching posts… this may take a few seconds.</p>
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button
            onClick={loadPosts}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {state === 'loaded' && posts.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No posts found for this profile.</p>
      )}

      {state === 'loaded' && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
