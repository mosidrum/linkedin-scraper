'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
  multiline?: boolean
  placeholder?: string
  className?: string
  label?: string
}

export function EditableField({ value, onChange, multiline = false, placeholder, className = '', label }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  function startEdit() {
    setDraft(value)
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    if (draft.trim() !== value) onChange(draft.trim())
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      commit()
    }
  }

  useEffect(() => {
    if (editing) (ref.current as HTMLElement)?.focus()
  }, [editing])

  if (editing) {
    const sharedProps = {
      ref: ref as React.RefObject<HTMLTextAreaElement & HTMLInputElement>,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKey,
      placeholder,
      'aria-label': label,
      className: `w-full rounded-lg border border-blue-400 bg-blue-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`,
    }

    return multiline ? (
      <textarea {...sharedProps} rows={4} className={`${sharedProps.className} resize-none`} />
    ) : (
      <input {...sharedProps} type="text" />
    )
  }

  return (
    <div
      className={`group relative cursor-text rounded-lg px-3 py-2 -mx-3 -my-2 hover:bg-gray-50 transition-colors ${className}`}
      onClick={startEdit}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${label ?? 'field'}`}
      onKeyDown={(e) => e.key === 'Enter' && startEdit()}
    >
      <span className={value ? '' : 'text-gray-400 italic'}>{value || placeholder || 'Click to edit'}</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 text-xs transition-opacity">
        ✏️
      </span>
    </div>
  )
}
