// src/components/Feed.tsx
import { useEffect, useMemo, useState } from 'react'
import ReplyBox from '../ReplyBox'

type Reply = { id: string; text: string; timestamp: string }
type Message = { id: string; text: string; lat: number; lon: number; timestamp: string; replies?: Reply[] }

export default function Feed({ coords, refreshKey }: { coords: {lat:number; lon:number} | null | undefined; refreshKey?: number }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const query = useMemo(() => {
    if (!coords) return null
    const { lat, lon } = coords
    return `/api/feed?lat=${lat}&lon=${lon}`
  }, [coords])

  async function loadFeed() {
    if (!query) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch(query)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Message[]
      // sort newest → oldest; normalize replies
      const normalized = data
        .map(m => ({ ...m, replies: Array.isArray(m.replies) ? m.replies : [] }))
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setMessages(normalized)
    } catch (e: unknown) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!query) return
    let alive = true

    const fetchFeed = async () => {
      try {
        const res = await fetch(query)
        if (!res.ok) return
        const data = (await res.json()) as Message[]
        if (alive) {
          const normalized = data
            .map(m => ({ ...m, replies: Array.isArray(m.replies) ? m.replies : [] }))
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          setMessages(normalized)
          setLoading(false)
        }
      } catch { /* ignore transient errors */ }
    }

    setLoading(true)
    fetchFeed()
    const id = setInterval(fetchFeed, 10_000)
    return () => { alive = false; clearInterval(id) }
  }, [query])

  // manual refresh when PostForm calls onPosted()
  useEffect(() => { if (refreshKey !== undefined) loadFeed() }, [refreshKey]) // <-- new

  if (!coords) return <div style={{ marginTop: 12 }}>Enable location to see nearby posts.</div>
  if (error) return <div style={{ color: 'crimson', marginTop: 12 }}>Feed error: {error}</div>
  if (loading) return <div style={{ marginTop: 12 }}>Loading nearby messages…</div>
  if (!messages.length) return <div style={{ marginTop: 12 }}>No messages within 2 km yet.</div>

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Nearby Messages</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map(m => (
          <li key={m.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{m.text}</div>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
              {m.replies?.map((r) => (
                <li key={r.id} style={{ marginLeft: 12, color: '#444' }}>↳ {r.text}</li>
              ))}
            </ul>

            <ReplyBox messageId={m.id} onReplied={loadFeed} />
          </li>
        ))}
      </ul>
    </div>
  )
}
