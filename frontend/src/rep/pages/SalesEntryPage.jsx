import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, computeReport } from '../context/AppContext'
import { AppShell, PageHeader, StepFlow, StickyActionBar } from '../components/Layout'
import { Card, SectionLabel } from '../components/Card'
import { NumberInput } from '../components/NumberInput'
import { TotalsBar } from '../components/TotalsBar'
import { OccupancyBar } from '../components/Progress'
import { StatusBadge } from '../components/Badge'
import { PrimaryButton } from '../components/Button'
import { IconLock, IconGauge } from '../components/icons'
import { getTheatre, getScreen, getMovie, getReportDates, sortByCategory } from '../data/mockData'
import { formatCurrency, formatCount, formatPercent, formatDate } from '../utils/format'

// A read-only context strip for the chosen show.
function ShowContext({ theatre, screen, movie, date, time }) {
  const items = [
    ['Theatre', theatre.name],
    ['Screen', screen.name],
    ['Movie', movie.title],
    ['Date', formatDate(date)],
    ['Show', time],
  ]
  return (
    <Card className="mb-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-5">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
              {label}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function SalesEntryPage() {
  const navigate = useNavigate()
  const { draft, setSeatsSold, showToast } = useApp()

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

  const rawByCat = draft.seatsSold || {}
  const allFilled = plan.every((row) => {
    const v = rawByCat[row.category]
    return v !== '' && v !== null && v !== undefined
  })

  const proceed = () => {
    if (!allFilled) {
      showToast('Enter seats sold for every category', 'warning')
      return
    }
    navigate('/review')
  }

  // Shared cell renderers
  const rows = plan.map((row) => {
    const raw = rawByCat[row.category]
    const filled = raw !== '' && raw !== null && raw !== undefined
    const sold = filled ? Number(raw) : 0
    const actual = sold * row.price
    const occ = row.seats ? sold / row.seats : 0
    return { row, raw, filled, sold, actual, occ }
  })

  return (
    <AppShell>
      <StepFlow current={2} />
      <PageHeader
        title="Ticket sales entry"
        subtitle="Enter the actual number of seats sold per category"
        onBack={() => navigate(`/theatres/${draft.theatreId}`)}
        backLabel={theatre.name}
      />

      <ShowContext theatre={theatre} screen={screen} movie={movie} date={draft.date} time={draft.time} />

      {/* Section 1 label — read-only reference */}
      <div className="mb-2.5 flex items-center justify-between">
        <SectionLabel>Seat categories</SectionLabel>
        <span className="flex items-center gap-1 text-[11px] font-medium text-ink-faint">
          <IconLock width={11} height={11} />
          Prices &amp; capacity are fixed
        </span>
      </div>

      {/* ---- Wide viewport: table ---- */}
      <div className="mb-5 hidden overflow-hidden rounded-xl border border-line sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-muted">
              <th className="border-b border-line px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Category
              </th>
              <th className="border-b border-line px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Total seats
              </th>
              <th className="border-b border-line px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Price
              </th>
              <th className="border-b border-line px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Max collection
              </th>
              <th className="w-40 border-b border-l border-line bg-accent-soft/30 px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-accent-ink">
                Seats sold
              </th>
              <th className="border-b border-line px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Actual collection
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, raw, actual }) => (
              <tr key={row.category} className="bg-surface">
                <td className="border-b border-line px-4 py-3 font-semibold text-ink">
                  {row.category}
                </td>
                <td className="num border-b border-line px-4 py-3 text-right text-ink-soft">
                  {formatCount(row.seats)}
                </td>
                <td className="num border-b border-line px-4 py-3 text-right text-ink-soft">
                  {formatCurrency(row.price)}
                </td>
                <td className="num border-b border-line px-4 py-3 text-right text-ink-soft">
                  {formatCurrency(row.seats * row.price)}
                </td>
                <td className="border-b border-l border-line bg-accent-soft/10 px-3 py-2">
                  <NumberInput
                    value={raw ?? ''}
                    max={row.seats}
                    ariaLabel={`Seats sold for ${row.category}`}
                    onChange={(v) => setSeatsSold(row.category, v)}
                  />
                </td>
                <td className="num border-b border-line px-4 py-3 text-right font-semibold text-ink">
                  {formatCurrency(actual)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Narrow viewport: stacked cards with prominent input ---- */}
      <div className="mb-5 flex flex-col gap-3 sm:hidden">
        {rows.map(({ row, raw, actual }) => (
          <Card key={row.category} className="p-4">
            <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
              <span className="font-bold text-ink">{row.category}</span>
              <span className="num text-sm text-ink-soft">
                {formatCount(row.seats)} seats · {formatCurrency(row.price)}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
                  Max collection
                </div>
                <div className="num mt-0.5 font-medium text-ink-soft">
                  {formatCurrency(row.seats * row.price)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
                  Actual collection
                </div>
                <div className="num mt-0.5 font-semibold text-ink">{formatCurrency(actual)}</div>
              </div>
            </div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.05em] text-accent-ink">
              Seats sold
            </label>
            <NumberInput
              value={raw ?? ''}
              max={row.seats}
              ariaLabel={`Seats sold for ${row.category}`}
              onChange={(v) => setSeatsSold(row.category, v)}
            />
          </Card>
        ))}
      </div>

      {/* Section 2 — auto-calculated summary */}
      <SectionLabel className="mb-2.5">Calculated summary</SectionLabel>
      <TotalsBar
        className="mb-4"
        items={[
          {
            label: 'Seats sold',
            value: `${formatCount(computed.totalSold)} / ${formatCount(computed.totalSeats)}`,
            tone: 'accent',
          },
          { label: 'Unsold seats', value: formatCount(computed.totalUnsold) },
          { label: 'Occupancy', value: formatPercent(computed.occupancy), tone: 'neutral' },
          {
            label: 'Actual collection',
            value: formatCurrency(computed.actualCollection),
            tone: 'success',
          },
        ]}
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
              <IconGauge width={13} height={13} />
              Overall occupancy
            </div>
            <OccupancyBar ratio={computed.occupancy} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-muted px-4 py-3 sm:min-w-[240px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Collection shortfall / gap
              </div>
              <div className="text-xs text-ink-faint">Max − Actual</div>
            </div>
            <div
              className={`num text-xl font-bold ${
                computed.difference > 0 ? 'text-danger-ink' : 'text-success-ink'
              }`}
            >
              {computed.difference > 0 ? '−' : ''}
              {formatCurrency(computed.difference)}
            </div>
          </div>
        </div>
      </Card>

      {!allFilled && (
        <div className="mb-2">
          <StatusBadge tone="warning" dot>
            Enter seats sold for every category to continue
          </StatusBadge>
        </div>
      )}

      <StickyActionBar>
        <div className="hidden flex-1 sm:block">
          <div className="text-xs text-ink-faint">Total actual collection</div>
          <div className="num text-lg font-bold text-ink">
            {formatCurrency(computed.actualCollection)}
          </div>
        </div>
        <PrimaryButton className="w-full sm:w-auto" disabled={!allFilled} onClick={proceed}>
          Review report
        </PrimaryButton>
      </StickyActionBar>
    </AppShell>
  )
}
