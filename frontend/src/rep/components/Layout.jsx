// App shell, page container, workflow step indicator, page header.

import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { IconTicket, IconLogout, IconArrowLeft, IconCheck } from './icons'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
        <IconTicket width={20} height={20} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-ink">CineReport</div>
          <div className="text-[11px] font-medium text-ink-faint">Distribution Reporting</div>
        </div>
      )}
    </div>
  )
}

// Top bar shown on authenticated pages.
export function AppShell({ children }) {
  const { representative, logout } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-app items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/theatres')}
            className="rounded-lg focus-visible:shadow-focus focus-visible:outline-none"
          >
            <Brand />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold leading-tight text-ink">
                {representative.name}
              </div>
              <div className="text-[11px] text-ink-faint">{representative.role}</div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-ink">
              {representative.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/')
              }}
              aria-label="Log out"
              title="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink focus-visible:shadow-focus focus-visible:outline-none"
            >
              <IconLogout width={18} height={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-app px-4 pb-24 pt-5 sm:px-6 sm:pt-7">{children}</main>
    </div>
  )
}

// A back-header for interior pages.
export function PageHeader({ title, subtitle, onBack, backLabel = 'Back', right }) {
  return (
    <div className="mb-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:shadow-focus focus-visible:outline-none"
        >
          <IconArrowLeft width={18} height={18} />
          {backLabel}
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[26px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}

// Workflow step indicator (Theatre → Show → Sales → Review).
const STEPS = ['Theatre', 'Show', 'Sales', 'Review']

export function StepFlow({ current }) {
  return (
    <ol className="mb-6 flex items-center gap-1.5 sm:gap-2">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo'
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <div
              className={cx(
                'flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 sm:pr-3',
                state === 'active' && 'bg-accent-soft',
              )}
            >
              <span
                className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  state === 'done' && 'bg-success text-white',
                  state === 'active' && 'bg-accent text-white',
                  state === 'todo' && 'bg-surface-muted text-ink-faint ring-1 ring-inset ring-line',
                )}
              >
                {state === 'done' ? <IconCheck width={14} height={14} /> : i + 1}
              </span>
              <span
                className={cx(
                  'hidden text-xs font-semibold sm:inline',
                  state === 'active' ? 'text-accent-ink' : state === 'done' ? 'text-ink' : 'text-ink-faint',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cx(
                  'h-px flex-1',
                  i < current ? 'bg-success/50' : 'bg-line',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// Sticky bottom action bar — keeps the primary action reachable on long
// mobile pages. Content is centred to the app width.
export function StickyActionBar({ children }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3 sm:px-6">{children}</div>
    </div>
  )
}
