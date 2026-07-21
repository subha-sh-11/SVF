import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, computeReport } from '../context/AppContext'
import { AppShell, PageHeader, StepFlow, StickyActionBar } from '../components/Layout'
import { Card } from '../components/Card'
import { DataTable } from '../components/DataTable'
import { ReadOnlyRow } from '../components/ReadOnlyField'
import { TotalsBar, GrandTotal } from '../components/TotalsBar'
import { OccupancyBar } from '../components/Progress'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PrimaryButton, SecondaryButton } from '../components/Button'
import { IconCheck } from '../components/icons'
import { getTheatre, getScreen, getMovie, sortByCategory, reportKey } from '../data/mockData'
import { formatCurrency, formatCount, formatPercent, formatDate } from '../utils/format'

export default function ReportReviewPage() {
  const navigate = useNavigate()
  const { draft, submitReport, isSubmitted, showToast } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!draft?.screenId || !draft?.time) navigate('/theatres', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const theatre = draft ? getTheatre(draft.theatreId) : null
  const screen = draft ? getScreen(draft.theatreId, draft.screenId) : null
  const movie = screen ? getMovie(screen.movieId) : null
  const plan = screen ? sortByCategory(screen.plan) : []

  const computed = useMemo(
    () => computeReport(plan, draft?.seatsSold || {}),
    [plan, draft?.seatsSold],
  )

  if (!theatre || !screen || !movie) return null

  const alreadySubmitted = isSubmitted(reportKey(draft))

  const columns = [
    { key: 'category', header: 'Category', mobilePrimary: true, render: (r) => (
      <span className="font-semibold text-ink">{r.category}</span>
    ) },
    { key: 'seats', header: 'Seats', numeric: true, render: (r) => formatCount(r.seats) },
    { key: 'sold', header: 'Sold', numeric: true, render: (r) => (
      <span className="font-semibold text-ink">{formatCount(r.sold)}</span>
    ) },
    { key: 'unsold', header: 'Unsold', numeric: true, render: (r) => formatCount(r.unsold) },
    { key: 'price', header: 'Price', numeric: true, render: (r) => formatCurrency(r.price) },
    { key: 'actual', header: 'Actual', numeric: true, render: (r) => (
      <span className="font-semibold text-ink">{formatCurrency(r.actualCollection)}</span>
    ) },
    { key: 'occ', header: 'Occupancy', numeric: true, render: (r) => formatPercent(r.seats ? r.sold / r.seats : 0) },
  ]

  const totals = {
    label: 'Total',
    cells: {
      category: 'Total',
      seats: formatCount(computed.totalSeats),
      sold: formatCount(computed.totalSold),
      unsold: formatCount(computed.totalUnsold),
      actual: formatCurrency(computed.actualCollection),
      occ: formatPercent(computed.occupancy),
    },
  }

  const doSubmit = async () => {
    setSubmitting(true)
    const record = await submitReport(computed)
    setSubmitting(false)
    setConfirmOpen(false)
    if (record) {
      showToast('Report submitted', 'success')
      navigate('/success', { replace: true, state: { record } })
    } else {
      showToast('Could not submit report. Please try again.', 'danger')
    }
  }

  return (
    <AppShell>
      <StepFlow current={3} />
      <PageHeader
        title="Review report"
        subtitle="Confirm all details before submitting"
        onBack={() => navigate('/entry')}
        backLabel="Edit sales"
        right={
          <SecondaryButton size="md" onClick={() => navigate('/entry')}>
            Edit
          </SecondaryButton>
        }
      />

      {/* Show reference summary */}
      <Card className="mb-5">
        <div className="grid gap-x-8 px-5 py-2 sm:grid-cols-2">
          <div className="divide-y divide-line">
            <ReadOnlyRow label="Theatre" value={theatre.name} />
            <ReadOnlyRow label="Location" value={`${theatre.location}, ${theatre.city}`} />
            <ReadOnlyRow label="Screen" value={screen.name} />
          </div>
          <div className="divide-y divide-line">
            <ReadOnlyRow label="Movie" value={movie.title} />
            <ReadOnlyRow label="Date" value={formatDate(draft.date)} />
            <ReadOnlyRow label="Show timing" value={draft.time} numeric />
          </div>
        </div>
      </Card>

      {/* Per-category breakdown */}
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        Sales breakdown
      </p>
      <DataTable
        className="mb-5"
        columns={columns}
        rows={computed.rows}
        getRowKey={(r) => r.category}
        totals={totals}
        caption="Seats sold and collection per seat category"
      />

      {/* Headline totals */}
      <TotalsBar
        className="mb-4"
        items={[
          { label: 'Total seats', value: formatCount(computed.totalSeats) },
          { label: 'Seats sold', value: formatCount(computed.totalSold), tone: 'accent' },
          { label: 'Occupancy', value: formatPercent(computed.occupancy) },
          { label: 'Unsold', value: formatCount(computed.totalUnsold) },
        ]}
      />

      <Card className="mb-4 p-5">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
          Occupancy
        </div>
        <OccupancyBar ratio={computed.occupancy} />
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <GrandTotal
          label="Total actual collection"
          hint="Sum of all categories"
          tone="success"
          value={formatCurrency(computed.actualCollection)}
        />
        <GrandTotal
          label="Collection shortfall / gap"
          hint={`Max ${formatCurrency(computed.maxCollection)} − Actual`}
          tone={computed.difference > 0 ? 'danger' : 'success'}
          value={`${computed.difference > 0 ? '−' : ''}${formatCurrency(computed.difference)}`}
        />
      </div>

      <StickyActionBar>
        <div className="hidden flex-1 sm:block">
          <div className="text-xs text-ink-faint">Submitting collection of</div>
          <div className="num text-lg font-bold text-ink">
            {formatCurrency(computed.actualCollection)}
          </div>
        </div>
        <PrimaryButton
          className="w-full sm:w-auto"
          disabled={alreadySubmitted}
          onClick={() => setConfirmOpen(true)}
        >
          <IconCheck width={18} height={18} />
          {alreadySubmitted ? 'Already submitted' : 'Submit report'}
        </PrimaryButton>
      </StickyActionBar>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit this show report?"
        message="Please confirm the seats sold and collection are correct. Once submitted, this report is final and you may not be able to edit it."
        confirmLabel="Yes, submit"
        cancelLabel="Go back"
        loading={submitting}
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  )
}
