// Occupancy progress indicator — subtle inline bar + percentage.

import { formatPercent } from '../utils/format'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

function toneForOccupancy(pct) {
  if (pct >= 85) return 'success'
  if (pct >= 50) return 'accent'
  if (pct >= 25) return 'warning'
  return 'danger'
}

const barColor = {
  success: 'bg-success',
  accent: 'bg-accent',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function OccupancyBar({ ratio, showLabel = true, size = 'md', className }) {
  const pct = Math.max(0, Math.min(100, Number(ratio) * 100))
  const tone = toneForOccupancy(pct)
  const height = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={cx('flex items-center gap-2.5', className)}>
      <div className={cx('relative flex-1 overflow-hidden rounded-full bg-surface-muted', height)}>
        <div
          className={cx('absolute inset-y-0 left-0 rounded-full transition-all', barColor[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cx('num w-12 shrink-0 text-right text-sm font-semibold', {
          success: 'text-success-ink',
          accent: 'text-accent-ink',
          warning: 'text-warning-ink',
          danger: 'text-danger-ink',
        }[tone])}>
          {formatPercent(ratio)}
        </span>
      )}
    </div>
  )
}

export { toneForOccupancy }
