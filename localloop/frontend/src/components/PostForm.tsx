import React, { useState } from 'react'
import type { FormEvent } from 'react'

type Coords = { lat: number; lon: number }

interface Props {
  coords: Coords | null | undefined
  onPosted?: () => void
}

export default function PostForm({ coords, onPosted }: Props) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canPost = text.trim().length > 0 && !!coords

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canPost) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          lat: coords!.lat,
          lon: coords!.lon
        })
      })
      if (!res.ok) throw new Error('Failed to post')
      setText('')
      onPosted?.()
    } catch {
      alert('Could not post message. Is the backend running on http://localhost:8080?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '.75rem' }}>
      <textarea
        placeholder={coords ? "What's happening nearby?" : 'Waiting for location…'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={280}
      />
      <div className="row">
        <small className="char">{text.length}/280</small>
        <button type="submit" disabled={!canPost || submitting}>
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
