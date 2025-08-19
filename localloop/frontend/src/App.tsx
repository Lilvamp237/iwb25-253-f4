import { useState } from 'react'
import './app.css'
import PostForm from './components/PostForm'
import Feed from './components/Feed'
import useGeolocation from './hooks/useGeolocation'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const { coords, error, loading } = useGeolocation()
  const [refreshKey, setRefreshKey] = useState(0)

  function onPosted() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container">
      {/* Top-right toggle */}
      <header className="topbar">
        <ThemeToggle />
      </header>

      {/* Centered title + subtitle */}
      <div className="hero">
        <h1 className="page-title">LocalLoop</h1>
        <p className="subtitle muted">Anonymous, hyper-local posts that expire in 48h.</p>
      </div>

      {loading && <p>Getting your location…</p>}
      {error && (
        <p className="muted">
          Location unavailable. You can still view a demo feed or retry later.
        </p>
      )}

      <PostForm coords={coords} onPosted={onPosted} />
      <Feed coords={coords} refreshKey={refreshKey} />
    </div>
  )
}
