import { useState } from 'react'
import './app.css'
import PostForm from './components/PostForm'
import Feed from './components/Feed'
import useGeolocation from './hooks/useGeolocation'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const { coords, error, loading } = useGeolocation()
  const [refreshKey, setRefreshKey] = useState(0)

  function refreshFeed() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container">
      <header className="topbar">
        <ThemeToggle />
      </header>

      <div className="hero">
        <h1 className="page-title">LocalLoop</h1>
        <p className="subtitle muted">Anonymous, hyper-local posts that expire in 48h.</p>
      </div>

      {loading && <p className="muted">Getting your location…</p>}
      {error && (
        <p className="error-text">
          Location unavailable. You can't post, but you can view the feed.
        </p>
      )}

      {/* PostForm creates new messages and triggers a refresh */}
      <PostForm coords={coords} onPosted={refreshFeed} />
      
      {/* Feed fetches data and its children will also trigger a refresh */}
      <Feed refreshKey={refreshKey} onRefreshed={refreshFeed} />
    </div>
  )
}