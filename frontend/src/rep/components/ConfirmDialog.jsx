// ConfirmDialog — modal confirmation before an irreversible action.
// Focus-trapped-ish (autoFocus on confirm), Escape to cancel, backdrop click cancels.

import { useEffect } from 'react'
import { PrimaryButton, SecondaryButton } from './Button'
import { IconAlert } from './icons'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'accent', // 'accent' | 'danger'
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade-in"
        onClick={() => !loading && onCancel?.()}
      />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-line bg-surface p-5 shadow-pop sm:p-6">
        <div className="flex gap-4">
          <span
            className={cx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent',
            )}
          >
            <IconAlert width={22} height={22} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onCancel} disabled={loading} className="sm:w-auto">
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            autoFocus
            onClick={onConfirm}
            loading={loading}
            className={cx(
              'sm:w-auto',
              tone === 'danger' && 'bg-danger hover:bg-danger-ink',
            )}
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
