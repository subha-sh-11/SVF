// ReadOnlyField — displays predefined reference data. Deliberately
// looks NON-editable: muted surface, no input affordance, a small lock
// hint. This is the visual counterpart to the editable NumberInput.

import { IconLock } from './icons'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function ReadOnlyField({ label, value, hint, numeric, lock = false, className }) {
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      {label && (
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          {label}
          {lock && <IconLock width={11} height={11} className="text-ink-faint" />}
        </span>
      )}
      <div
        className={cx(
          'flex min-h-[42px] items-center rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink',
          numeric ? 'num justify-end text-right font-medium' : 'font-medium',
        )}
      >
        {value}
      </div>
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </div>
  )
}

// Inline read-only key/value row (label left, value right).
export function ReadOnlyRow({ label, value, numeric, strong, className }) {
  return (
    <div
      className={cx(
        'flex items-center justify-between gap-4 py-2',
        strong && 'font-semibold',
        className,
      )}
    >
      <span className="text-sm text-ink-soft">{label}</span>
      <span className={cx('text-sm text-ink', numeric && 'num tabular-nums', strong && 'text-ink')}>
        {value}
      </span>
    </div>
  )
}
