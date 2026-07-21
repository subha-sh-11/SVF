import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AppShell } from '../components/Layout'
import { Card } from '../components/Card'
import { ReadOnlyRow } from '../components/ReadOnlyField'
import { PrimaryButton, SecondaryButton } from '../components/Button'
import { IconCheckCircle, IconList, IconTicket } from '../components/icons'
import { formatCurrency, formatCount, formatPercent, formatDate } from '../utils/format'

export default function SuccessPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { clearDraft, submissions } = useApp()

  // Fall back to the most recent submission if navigated directly.
  const record = state?.record || submissions[0]

  useEffect(() => {
    clearDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!record) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-ink-soft">No submission found.</p>
          <PrimaryButton className="mt-4" onClick={() => navigate('/theatres')}>
            Back to theatres
          </PrimaryButton>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg animate-slide-up py-6 sm:py-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <IconCheckCircle width={40} height={40} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">Report submitted</h1>
          <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
            The show report for <span className="font-semibold text-ink">{record.movieTitle}</span> has
            been recorded successfully.
          </p>
        </div>

        <Card className="mt-6">
          <div className="border-b border-line px-5 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
              Submission summary
            </div>
          </div>
          <div className="divide-y divide-line px-5 py-1">
            <ReadOnlyRow label="Theatre" value={record.theatreName} />
            <ReadOnlyRow label="Screen" value={record.screenName} />
            <ReadOnlyRow label="Movie" value={record.movieTitle} />
            <ReadOnlyRow label="Date & show" value={`${formatDate(record.date)} · ${record.time}`} />
            <ReadOnlyRow
              label="Seats sold"
              value={`${formatCount(record.totalSold)} / ${formatCount(record.totalSeats)}`}
              numeric
            />
            <ReadOnlyRow label="Occupancy" value={formatPercent(record.occupancy)} numeric />
            <ReadOnlyRow
              label="Actual collection"
              value={formatCurrency(record.actualCollection)}
              numeric
              strong
            />
          </div>
        </Card>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton className="flex-1" onClick={() => navigate('/theatres')}>
            <IconTicket width={18} height={18} />
            Report another show
          </PrimaryButton>
          <SecondaryButton className="flex-1" onClick={() => navigate('/history')}>
            <IconList width={18} height={18} />
            View submission history
          </SecondaryButton>
        </div>
      </div>
    </AppShell>
  )
}
