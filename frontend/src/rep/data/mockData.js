// ============================================================
// Reference catalogue for the representative app.
// Theatres/screens/seat-plans are now the REAL Nizam centres
// (first 10), generated from the shared database into
// realCatalogue.json. Seat "categories" are the rate slabs
// (price = rate, seats = audience). Shows are the OG slots.
// Only "seats sold" is entered by the representative.
// ============================================================
import catalogue from './realCatalogue.json'

export const DEMO_OTP = '123456'

export const REPRESENTATIVE = {
  id: 'rep-001',
  name: 'Arjun Mehta',
  mobile: '9876543210',
  role: 'Theatre Representative',
}

// Categories are ₹-rate based now; order by price (handled in sortByCategory).
export const SEAT_CATEGORY_ORDER = []

// ---- Movie (reference) ----
export const MOVIES = {
  ogm: { id: 'ogm', title: 'OG', language: 'Telugu', cert: 'UA', runtime: '2h 30m' },
}

// ---- Theatres → screens (real, from the Nizam centres list) ----
export const THEATRES = catalogue.theatres

// The representative is assigned these theatres (mirrors the DB assignments).
export const ASSIGNED_THEATRE_IDS = catalogue.assignedIds

// ---- Derived helpers ----

export function getAssignedTheatres() {
  return THEATRES.filter((t) => ASSIGNED_THEATRE_IDS.includes(t.id))
}

export function getTheatresByIds(ids) {
  const set = new Set(ids || [])
  return THEATRES.filter((t) => set.has(t.id))
}

export function getTheatre(theatreId) {
  return THEATRES.find((t) => t.id === theatreId) || null
}

export function getScreen(theatreId, screenId) {
  const t = getTheatre(theatreId)
  return t ? t.screens.find((s) => s.id === screenId) || null : null
}

export function getMovie(movieId) {
  return MOVIES[movieId] || null
}

/** Max (full-house) collection for a seat plan. */
export function planMaxCollection(plan) {
  return plan.reduce((sum, row) => sum + row.seats * row.price, 0)
}

/** Total capacity of a seat plan. */
export function planCapacity(plan) {
  return plan.reduce((sum, row) => sum + row.seats, 0)
}

/** Sort seat rows premium → standard (by price, high first). */
export function sortByCategory(rows) {
  return [...rows].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
}

// ---- Selectable report dates (today + next two days) ----
export function getReportDates() {
  const out = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  for (let i = 0; i < 3; i += 1) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/** A stable key identifying a unique show report. */
export function reportKey({ theatreId, screenId, movieId, date, time }) {
  return [theatreId, screenId, movieId, date, time].join('|')
}
