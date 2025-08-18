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

          <button
            type="submit"
            disabled={!canPost || submitting}
            className="btn-send"
          >
            <span className="svg-wrapper-1">
              <span className="svg-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                >
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  ></path>
                </svg>
              </span>
            </span>
            <span className="btn-label">{submitting ? 'Posting…' : 'Send'}</span>
          </button>
      </div>
    </form>
  )
}
