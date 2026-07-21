// NumberInput — the ONE editable control in the app. Integer-only,
// non-negative, clamped to a max. Deliberately looks interactive
// (white field, clear border, accent focus ring, stepper buttons).

import { useCallback } from 'react'
import { parseSeatCount } from '../utils/format'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function NumberInput({
  value,
  onChange,
  max,
  min = 0,
  invalid = false,
  disabled = false,
  ariaLabel,
  className,
}) {
  const current = value === '' || value == null ? '' : Number(value)

  const commit = useCallback(
    (next) => {
      if (next === '' || next == null) {
        onChange('')
        return
      }
      let n = parseSeatCount(next)
      if (n == null) {
        onChange('')
        return
      }
      if (typeof max === 'number') n = Math.min(n, max)
      if (typeof min === 'number') n = Math.max(n, min)
      onChange(n)
    },
    [onChange, max, min],
  )

  const step = useCallback(
    (delta) => {
      const cur = current === '' ? 0 : current
      commit(cur + delta)
    },
    [current, commit],
  )

  const atMax = typeof max === 'number' && current !== '' && current >= max
  const atMin = current === '' || current <= min

  return (
    <div
      className={cx(
        'group inline-flex h-11 w-full items-stretch overflow-hidden rounded-lg border bg-surface transition-shadow',
        invalid
          ? 'border-danger shadow-[0_0_0_3px_var(--color-danger-soft)]'
          : 'border-line-strong focus-within:border-accent focus-within:shadow-focus',
        disabled && 'opacity-60',
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || atMin}
        onClick={() => step(-1)}
        className="flex w-10 shrink-0 items-center justify-center border-r border-line text-lg font-semibold text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        step={1}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        value={current}
        onChange={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
        }}
        onFocus={(e) => e.target.select()}
        placeholder="0"
        className="num w-full min-w-0 bg-transparent px-2 text-center text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-faint"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || atMax}
        onClick={() => step(1)}
        className="flex w-10 shrink-0 items-center justify-center border-l border-line text-lg font-semibold text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}
