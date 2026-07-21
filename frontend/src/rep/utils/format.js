// ============================================================
// Number & currency formatting — Indian conventions.
// Indian digit grouping (lakh/crore): 36,400 · 1,20,000 · 45,000.
// Pair these with the `.num` class for tabular alignment.
// ============================================================

const INR = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

/** Group an integer with Indian digit grouping. e.g. 120000 -> "1,20,000" */
export function groupIndian(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return INR.format(Math.round(n))
}

/** Currency in Indian Rupees. e.g. 120000 -> "₹1,20,000" */
export function formatCurrency(value) {
  return `₹${groupIndian(value)}`
}

/** Plain integer count with grouping. e.g. 1200 -> "1,200" */
export function formatCount(value) {
  return groupIndian(value)
}

/** Occupancy percentage, rounded. e.g. 0.8123 or 81.23 handled via ratio. */
export function formatPercent(soldRatio) {
  const pct = Math.max(0, Math.min(100, Number(soldRatio) * 100))
  return `${pct % 1 === 0 ? pct : pct.toFixed(1)}%`
}

/** Occupancy as a 0–100 number for progress bars. */
export function occupancyPct(sold, total) {
  if (!total) return 0
  return Math.max(0, Math.min(100, (Number(sold) / Number(total)) * 100))
}

/** Parse a user-typed seat count into a clean non-negative integer (or null). */
export function parseSeatCount(raw) {
  if (raw === '' || raw === null || raw === undefined) return null
  const cleaned = String(raw).replace(/[^\d]/g, '')
  if (cleaned === '') return null
  return parseInt(cleaned, 10)
}

/** Format a date (Date | ISO string) as "Wed, 16 Jul 2026". */
export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Short date "16 Jul" for dense contexts. */
export function formatDateShort(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
