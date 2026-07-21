import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AppShell, PageHeader } from '../components/Layout'
import { Card } from '../components/Card'
import { DataTable } from '../components/DataTable'
import { SubmissionStatus, StatBadge } from '../components/Badge'
import { PrimaryButton } from '../components/Button'
import { IconList, IconTicket } from '../components/icons'
import { formatCurrency, formatCount, formatPercent, formatDate } from '../utils/format'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { submissions } = useApp()
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...submissions].sort((a, b) =>
      (b.submittedAt || '').localeCompare(a.submittedAt || ''),
    )
    if (!q) return sorted
    return sorted.filter((s) =>
      [s.theatreName, s.movieTitle, s.screenName].join(' ').toLowerCase().includes(q),
    )
  }, [submissions, query])

  const totals = useMemo(
    () => ({
      count: submissions.length,
      collection: submissions.reduce((sum, s) => sum + (s.actualCollection || 0), 0),
      seats: submissions.reduce((sum, s) => sum + (s.totalSold || 0), 0),
    }),
    [submissions],
  )

  const columns = [
    {
      key: 'show',
      header: 'Movie / Theatre',
      mobilePrimary: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-ink">{r.movieTitle}</div>
          <div className="text-xs text-ink-soft">
            {r.theatreName} · {r.screenName}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date & show',
      render: (r) => (
        <div className="whitespace-nowrap">
          <div className="text-sm text-ink">{formatDate(r.date)}</div>
          <div className="num text-xs text-ink-soft">{r.time}</div>
        </div>
      ),
    },
    { key: 'sold', header: 'Seats sold', numeric: true, render: (r) => (
      <span>
        <span className="font-semibold text-ink">{formatCount(r.totalSold)}</span>
        <span className="text-ink-faint"> / {formatCount(r.totalSeats)}</span>
      </span>
    ) },
    { key: 'occ', header: 'Occupancy', numeric: true, render: (r) => formatPercent(r.occupancy) },
    { key: 'collection', header: 'Collection', numeric: true, render: (r) => (
      <span className="font-semibold text-ink">{formatCurrency(r.actualCollection)}</span>
    ) },
    { key: 'status', header: 'Status', align: 'right', render: (r) => (
      <div className="flex justify-end sm:justify-end">
        <SubmissionStatus status={r.status} />
      </div>
    ) },
  ]

  const totalsRow = {
    label: 'Total',
    cells: {
      show: `${submissions.length} reports`,
      sold: formatCount(totals.seats),
      collection: formatCurrency(totals.collection),
    },
  }

  return (
    <AppShell>
      <PageHeader
        title="Submission history"
        subtitle="Show reports you have already submitted"
        onBack={() => navigate('/theatres')}
        backLabel="Theatres"
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatBadge label="Reports" value={formatCount(totals.count)} tone="accent" icon={<IconList width={12} height={12} />} />
        <StatBadge label="Seats sold" value={formatCount(totals.seats)} />
        <StatBadge label="Collection" value={formatCurrency(totals.collection)} tone="success" />
      </div>

      {submissions.length === 0 ? (
        <Card className="animate-fade-in">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
              <IconTicket width={28} height={28} />
            </span>
            <h3 className="mt-3 text-base font-semibold text-ink">No reports yet</h3>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Submitted show reports will appear here. Start by selecting a theatre.
            </p>
            <PrimaryButton className="mt-5" onClick={() => navigate('/theatres')}>
              Go to theatres
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by movie, theatre or screen…"
              className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-faint focus:border-accent focus:shadow-focus"
            />
          </div>
          {rows.length === 0 ? (
            <Card className="px-5 py-10 text-center text-sm text-ink-soft">
              No reports match “{query}”.
            </Card>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowKey={(r) => r.key}
              totals={totalsRow}
              caption="Submitted show reports"
            />
          )}
        </>
      )}
    </AppShell>
  )
}
