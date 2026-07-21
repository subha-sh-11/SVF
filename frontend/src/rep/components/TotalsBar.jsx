// TotalsBar — an emphasised summary of the key derived figures.
// Heavier weight, subtle accent tint, divider above. Used to make the
// bottom-line collection totals read with authority.

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const valueTone = {
  neutral: 'text-ink',
  accent: 'text-accent-ink',
  success: 'text-success-ink',
  warning: 'text-warning-ink',
  danger: 'text-danger-ink',
}

export function TotalsBar({ items, className }) {
  return (
    <div
      className={cx(
        'grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
            {item.label}
          </div>
          <div
            className={cx(
              'num mt-1 text-xl font-bold leading-tight tracking-tight',
              valueTone[item.tone || 'neutral'],
            )}
          >
            {item.value}
          </div>
          {item.hint && <div className="mt-0.5 text-xs text-ink-faint">{item.hint}</div>}
        </div>
      ))}
    </div>
  )
}

// A single prominent line — e.g. the headline "Total Actual Collection".
export function GrandTotal({ label, value, tone = 'accent', hint, className }) {
  return (
    <div
      className={cx(
        'flex items-center justify-between gap-4 rounded-xl border border-line bg-accent-soft/40 px-5 py-4',
        className,
      )}
    >
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        {hint && <div className="text-xs text-ink-soft">{hint}</div>}
      </div>
      <div className={cx('num text-2xl font-bold tracking-tight', valueTone[tone])}>{value}</div>
    </div>
  )
}
