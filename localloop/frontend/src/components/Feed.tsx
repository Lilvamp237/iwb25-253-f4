import React, { useEffect, useState } from 'react'

type Coords = { lat: number; lon: number }
type Message = { id?: string; text: string; timestamp?: string }

function timeAgo(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24); return `${days}d ago`
}

interface Props {
  coords: Coords | null | undefined
  refreshKey?: number
}

export default function Feed({ coords, refreshKey }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchFeed() {
      try {
        let url = '/api/feed'
        if (coords) url += `?lat=${coords.lat}&lon=${coords.lon}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Feed request failed')
        const data: Message[] = await res.json()
        if (!cancelled) setMessages(data)
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
          // demo data fallback
          setMessages([
            { id: 'demo1', text: '(demo) Hello neighbors!', timestamp: new Date().toISOString() },
            { id: 'demo2', text: '(demo) Anyone up for coffee?', timestamp: new Date(Date.now() - 120000).toISOString() }
          ])
        }
      }
    }
    fetchFeed()
    const id = setInterval(fetchFeed, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [coords, refreshKey])

  return (
    <section>
      <h2>Nearby Messages</h2>
      {error && <p className="muted">Showing demo feed (backend unreachable).</p>}
      <ul>
        {messages.map((m) => (
          <li key={m.id ?? m.timestamp}>
            <div>{m.text}</div>
            <small>{m.timestamp ? timeAgo(m.timestamp) : ''}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
