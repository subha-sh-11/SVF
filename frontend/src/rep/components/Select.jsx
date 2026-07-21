// Selectable option tiles used to pick a screen / movie / show timing.

import { IconCheck } from './icons'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

// A large radio-style tile (title + optional meta + optional right node).
export function OptionTile({ selected, onClick, title, meta, icon, right, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
        'focus-visible:shadow-focus focus-visible:outline-none',
        selected
          ? 'border-accent bg-accent-soft/50 shadow-sm ring-1 ring-accent'
          : 'border-line bg-surface hover:border-line-strong hover:shadow-card',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {icon && (
        <span
          className={cx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            selected ? 'bg-accent text-white' : 'bg-surface-muted text-ink-soft',
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-ink">{title}</div>
        {meta && <div className="mt-0.5 text-sm text-ink-soft">{meta}</div>}
      </div>
      {right}
      <span
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-accent bg-accent text-white' : 'border-line-strong bg-surface text-transparent',
        )}
      >
        <IconCheck width={13} height={13} />
      </span>
    </button>
  )
}

// A compact chip used for show timings (grid of times).
export function TimeChip({ selected, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'num rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all',
        'focus-visible:shadow-focus focus-visible:outline-none',
        selected
          ? 'border-accent bg-accent text-white shadow-sm'
          : 'border-line-strong bg-surface text-ink hover:border-accent hover:text-accent-ink',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  )
}
