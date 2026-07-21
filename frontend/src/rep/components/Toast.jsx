// Toast — transient confirmation / info message. Auto-dismisses.

import { useEffect } from 'react'
import { IconCheckCircle, IconAlert, IconClose } from './icons'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const toneMap = {
  success: { icon: IconCheckCircle, ring: 'text-success', bar: 'bg-success' },
  warning: { icon: IconAlert, ring: 'text-warning', bar: 'bg-warning' },
  danger: { icon: IconAlert, ring: 'text-danger', bar: 'bg-danger' },
  info: { icon: IconCheckCircle, ring: 'text-accent', bar: 'bg-accent' },
}

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => onDismiss(), 3200)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  const { icon: Icon, ring, bar } = toneMap[toast.tone] || toneMap.info

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface py-3 pl-4 pr-3 shadow-pop"
      >
        <span className={cx('shrink-0', ring)}>
          <Icon width={22} height={22} />
        </span>
        <p className="min-w-0 flex-1 text-sm font-medium text-ink">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <IconClose width={16} height={16} />
        </button>
        <span className={cx('absolute bottom-0 left-0 h-0.5', bar)} style={{ width: '100%' }} />
      </div>
    </div>
  )
}
