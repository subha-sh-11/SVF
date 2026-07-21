// StatusBadge — semantic status pills. StatBadge — small labelled metric chip.

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const tones = {
  neutral: 'bg-surface-muted text-ink-soft border-line',
  accent: 'bg-accent-soft text-accent-ink border-transparent',
  success: 'bg-success-soft text-success-ink border-transparent',
  warning: 'bg-warning-soft text-warning-ink border-transparent',
  danger: 'bg-danger-soft text-danger-ink border-transparent',
}

export function StatusBadge({ tone = 'neutral', dot = false, children, className }) {
  const dotColor = {
    neutral: 'bg-ink-faint',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }[tone]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  )
}

// Maps a report/submission status to a badge.
export function SubmissionStatus({ status }) {
  if (status === 'submitted')
    return (
      <StatusBadge tone="success" dot>
        Submitted
      </StatusBadge>
    )
  if (status === 'pending')
    return (
      <StatusBadge tone="warning" dot>
        Pending
      </StatusBadge>
    )
  return (
    <StatusBadge tone="neutral" dot>
      {status}
    </StatusBadge>
  )
}

// Small stat chip: label above, emphasised value below.
export function StatBadge({ label, value, tone = 'neutral', icon, className }) {
  const valueTone = {
    neutral: 'text-ink',
    accent: 'text-accent-ink',
    success: 'text-success-ink',
    warning: 'text-warning-ink',
    danger: 'text-danger-ink',
  }[tone]
  return (
    <div
      className={cx(
        'rounded-lg border border-line bg-surface px-3 py-2.5',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
        {icon}
        {label}
      </div>
      <div className={cx('num mt-1 text-lg font-semibold leading-none', valueTone)}>{value}</div>
    </div>
  )
}
