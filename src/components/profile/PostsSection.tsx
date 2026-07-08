'use client'

import { useState, useEffect } from 'react'
import type { PostItem, PostComment } from '@/lib/linkedin/types'

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

function CommentBubble({ comment }: { comment: PostComment }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-xs font-semibold text-[#0A66C2]">
        {comment.authorName?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs">
        {comment.authorName && (
          <span className="font-semibold text-gray-800">{comment.authorName} </span>
        )}
        <span className="text-gray-600">{comment.text}</span>
        <div className="mt-1 flex items-center gap-3 text-gray-400">
          {comment.postedAt && <span>{formatRelativeDate(comment.postedAt)}</span>}
          {comment.likesCount !== null && (
            <span className="flex items-center gap-0.5">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
              {formatCount(comment.likesCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: PostItem }) {
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const TRUNCATE_AT = 280
  const isLong = post.text.length > TRUNCATE_AT
  const displayText = isLong && !expanded ? post.text.slice(0, TRUNCATE_AT) + '…' : post.text
  const hasComments = post.comments.length > 0

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {post.isRepost && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">↩ Repost</span>
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
            className="text-xs text-[#0A66C2] hover:underline shrink-0 font-medium"
          >
            View post ↗
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
          className="text-xs text-[#0A66C2] hover:underline font-medium"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Engagement row */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        {post.likesCount !== null && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
            <svg className="h-3.5 w-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
            {formatCount(post.likesCount)}
          </span>
        )}
        {post.commentsCount !== null && (
          <button
            onClick={() => hasComments && setShowComments((s) => !s)}
            className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 transition-colors ${hasComments ? 'text-[#0A66C2] bg-blue-50 hover:bg-blue-100 cursor-pointer' : 'text-gray-500 bg-gray-50'}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {formatCount(post.commentsCount)}
            {hasComments && <span>{showComments ? '▲' : '▼'}</span>}
          </button>
        )}
        {post.repostsCount !== null && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {formatCount(post.repostsCount)}
          </span>
        )}
      </div>

      {showComments && hasComments && (
        <div className="space-y-2 pt-1">
          {post.comments.map((c) => (
            <CommentBubble key={c.id} comment={c} />
          ))}
        </div>
      )}
    </article>
  )
}

function PostSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 shadow-sm animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}

type LoadState = 'loading' | 'loaded' | 'error'

export function PostsSection({ profileUrl }: Props) {
  const [state, setState] = useState<LoadState>('loading')
  const [posts, setPosts] = useState<PostItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUrl])

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

      const loadedPosts = data.posts ?? []
      setPosts(loadedPosts)
      setState('loaded')

      console.group(`LinkedIn Scrapper — Posts (${loadedPosts.length})`)
      loadedPosts.forEach((p: PostItem, i: number) => {
        console.group(`Post ${i + 1}: ${p.text.slice(0, 60)}…`)
        console.log('ID:', p.id)
        console.log('Text:', p.text)
        console.log('Posted at:', p.postedAt)
        console.log('Likes:', p.likesCount)
        console.log('Comments count:', p.commentsCount)
        console.log('Reposts:', p.repostsCount)
        console.log('URL:', p.url)
        console.log('Is repost:', p.isRepost)
        if (p.comments.length > 0) console.log('Top comments:', p.comments)
        console.groupEnd()
      })
      console.log('Full posts array:', loadedPosts)
      console.groupEnd()
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
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">{posts.length} most recent</span>
        )}
      </div>

      {state === 'loading' && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
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
