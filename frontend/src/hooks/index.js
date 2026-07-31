import { useState, useEffect, useCallback, useRef } from 'react'

// ── Generic fetch hook ────────────────────────────────────────────────────────
export function useFetch(apiFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn()
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── Countdown timer (seconds) ─────────────────────────────────────────────────
// FIX: reset when totalSeconds prop changes (handles component remount / test change)
export function useCountdown(totalSeconds, onExpire) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef  = useRef(onExpire)
  const firedRef     = useRef(false)

  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  // Reset timer if totalSeconds changes (e.g. navigating to a different test)
  useEffect(() => {
    setRemaining(totalSeconds)
    firedRef.current = false
  }, [totalSeconds])

  useEffect(() => {
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onExpireRef.current?.()
      }
      return
    }
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id)
          if (!firedRef.current) {
            firedRef.current = true
            onExpireRef.current?.()
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return { remaining, display: `${mm}:${ss}`, isLow: remaining > 0 && remaining <= 60 }
}

// ── Debounce ──────────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── Dark mode ─────────────────────────────────────────────────────────────────
export function useDarkMode() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('tb_dark') === 'true'
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('tb_dark', String(dark))
  }, [dark])
  return [dark, () => setDark(d => !d)]
}
