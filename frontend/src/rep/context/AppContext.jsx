import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getScreen,
  getMovie,
  getTheatre,
  reportKey,
  sortByCategory,
} from '../data/mockData'

const AppContext = createContext(null)

// ---- Pure calculation: given a seat plan + seats-sold map, derive everything ----
export function computeReport(plan, seatsSold) {
  const rows = sortByCategory(plan).map((row) => {
    const sold = Number(seatsSold?.[row.category] ?? 0) || 0
    const clampedSold = Math.max(0, Math.min(sold, row.seats))
    const maxCollection = row.seats * row.price
    const actualCollection = clampedSold * row.price
    return {
      category: row.category,
      seats: row.seats,
      price: row.price,
      sold: clampedSold,
      unsold: row.seats - clampedSold,
      maxCollection,
      actualCollection,
    }
  })

  const totalSeats = rows.reduce((s, r) => s + r.seats, 0)
  const totalSold = rows.reduce((s, r) => s + r.sold, 0)
  const totalUnsold = totalSeats - totalSold
  const maxCollection = rows.reduce((s, r) => s + r.maxCollection, 0)
  const actualCollection = rows.reduce((s, r) => s + r.actualCollection, 0)
  const difference = maxCollection - actualCollection
  const occupancy = totalSeats ? totalSold / totalSeats : 0

  return {
    rows,
    totalSeats,
    totalSold,
    totalUnsold,
    maxCollection,
    actualCollection,
    difference,
    occupancy,
  }
}

// Tiny fetch helper — always sends the session cookie, always parses JSON.
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { ok: res.ok, status: res.status, data }
}

// Full-screen splash while we restore the session on first load.
function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
    </div>
  )
}

export function AppProvider({ children }) {
  const [booting, setBooting] = useState(true)
  // auth.verified drives the route guard; representative comes from the server.
  const [auth, setAuth] = useState({ mobile: '', verified: false })
  const [representative, setRepresentative] = useState(null)
  const [assignedTheatreIds, setAssignedTheatreIds] = useState([])

  // The in-progress report draft
  const [draft, setDraft] = useState(null)
  // { theatreId, screenId, movieId, date, time, seatsSold: {category: number} }

  // Submitted reports (loaded from the server for this rep)
  const [submissions, setSubmissions] = useState([])

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Math.random().toString(36).slice(2) })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  // Load the signed-in rep's assignments + submitted reports.
  const loadData = useCallback(async () => {
    const [t, r] = await Promise.all([api('/api/my-theatres'), api('/api/reports')])
    if (t.ok) setAssignedTheatreIds(t.data?.theatreIds || [])
    if (r.ok) setSubmissions(r.data?.reports || [])
  }, [])

  // Restore an existing session on first load (survives refresh).
  useEffect(() => {
    let alive = true
    ;(async () => {
      const me = await api('/api/me')
      if (alive && me.ok && me.data?.representative) {
        setRepresentative(me.data.representative)
        setAuth({ email: me.data.representative.email || '', verified: true })
        await loadData()
      }
      if (alive) setBooting(false)
    })()
    return () => {
      alive = false
    }
  }, [loadData])

  // Sign in with the predefined dummy email + password (validated against an
  // approved rep in the DB) and open a real session.
  const verify = useCallback(
    async (email, password) => {
      const res = await api('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return { ok: false, error: res.data?.error || 'Sign in failed.' }
      setRepresentative(res.data.representative)
      setAuth({ email: res.data.representative.email || email, verified: true })
      await loadData()
      return { ok: true }
    },
    [loadData],
  )

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' })
    setAuth({ mobile: '', verified: false })
    setRepresentative(null)
    setAssignedTheatreIds([])
    setSubmissions([])
    setDraft(null)
  }, [])

  // Begin / update the draft for a chosen show
  const startDraft = useCallback((partial) => {
    setDraft((prev) => ({
      seatsSold: {},
      ...(prev || {}),
      ...partial,
    }))
  }, [])

  const setSeatsSold = useCallback((category, value) => {
    setDraft((prev) => ({
      ...prev,
      seatsSold: { ...(prev?.seatsSold || {}), [category]: value },
    }))
  }, [])

  const clearDraft = useCallback(() => setDraft(null), [])

  const isSubmitted = useCallback(
    (key) => submissions.some((s) => s.key === key),
    [submissions],
  )

  // Finalize the current draft into a submission (persisted to the DB).
  const submitReport = useCallback(
    async (computed) => {
      if (!draft) return null
      const screen = getScreen(draft.theatreId, draft.screenId)
      const theatre = getTheatre(draft.theatreId)
      const movie = getMovie(draft.movieId)
      const payload = {
        key: reportKey(draft),
        theatreId: draft.theatreId,
        theatreName: theatre?.name,
        location: theatre?.location,
        screenId: draft.screenId,
        screenName: screen?.name,
        movieId: draft.movieId,
        movieTitle: movie?.title,
        date: draft.date,
        time: draft.time,
        totalSeats: computed.totalSeats,
        totalSold: computed.totalSold,
        totalUnsold: computed.totalUnsold,
        actualCollection: computed.actualCollection,
        maxCollection: computed.maxCollection,
        difference: computed.difference,
        occupancy: computed.occupancy,
      }
      const res = await api('/api/reports', { method: 'POST', body: JSON.stringify(payload) })
      if (!res.ok) return null
      const record = res.data.report
      setSubmissions((prev) => [record, ...prev.filter((s) => s.key !== record.key)])
      return record
    },
    [draft],
  )

  const value = useMemo(
    () => ({
      auth,
      representative,
      assignedTheatreIds,
      verify,
      logout,
      draft,
      startDraft,
      setSeatsSold,
      clearDraft,
      submissions,
      isSubmitted,
      submitReport,
      toast,
      showToast,
      dismissToast,
    }),
    [
      auth,
      representative,
      assignedTheatreIds,
      verify,
      logout,
      draft,
      startDraft,
      setSeatsSold,
      clearDraft,
      submissions,
      isSubmitted,
      submitReport,
      toast,
      showToast,
      dismissToast,
    ],
  )

  if (booting) return <BootSplash />

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
