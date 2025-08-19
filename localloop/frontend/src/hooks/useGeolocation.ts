import { useCallback, useEffect, useState } from 'react'

type Coords = { lat: number; lon: number }

type UseGeoloc = {
  coords: Coords | null
  loading: boolean
  error: GeolocationPositionError | Error | null
  refresh: () => void
}

export default function useGeolocation(): UseGeoloc {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<GeolocationPositionError | Error | null>(null)

  const get = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'))
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  useEffect(() => { get() }, [get])

  return { coords, loading, error, refresh: get }
}
