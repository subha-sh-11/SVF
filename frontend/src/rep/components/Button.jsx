// Primary / secondary buttons — large, obviously interactive, touch-friendly.

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const sizes = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
}

export function PrimaryButton({ className, size = 'lg', loading, disabled, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-white',
        'bg-accent shadow-sm transition-colors',
        'hover:bg-accent-hover active:translate-y-px',
        'focus-visible:shadow-focus focus-visible:ring-0',
        'disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-white/70 disabled:shadow-none disabled:active:translate-y-0',
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  )
}

export function SecondaryButton({ className, size = 'lg', disabled, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
        'border border-line-strong bg-surface text-ink transition-colors',
        'hover:bg-surface-muted active:translate-y-px',
        'focus-visible:shadow-focus',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function GhostButton({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
        'text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink',
        'focus-visible:shadow-focus',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
