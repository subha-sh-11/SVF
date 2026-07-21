import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AppShell, PageHeader, StepFlow } from '../components/Layout'
import { Card } from '../components/Card'
import { ReadOnlyField } from '../components/ReadOnlyField'
import { StatusBadge } from '../components/Badge'
import {
  IconFilm,
  IconClock,
  IconMapPin,
  IconBuilding,
  IconChevronRight,
  IconLock,
} from '../components/icons'
import { getTheatre, getMovie, getReportDates, reportKey, planCapacity } from '../data/mockData'
import { formatDate, formatDateShort, formatCount, formatCurrency, formatPercent } from '../utils/format'

function DateSelector({ dates, value, onChange }) {
  return (
    <div className="flex gap-2">
      {dates.map((d, i) => {
        const active = d === value
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDateShort(d)
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-center transition-all focus-visible:shadow-focus focus-visible:outline-none ${
              active
                ? 'border-accent bg-accent text-white shadow-sm'
                : 'border-line-strong bg-surface text-ink hover:border-accent'
            }`}
          >
            <div className="text-sm font-semibold">{label}</div>
            <div className={`num text-xs ${active ? 'text-white/80' : 'text-ink-faint'}`}>
              {formatDateShort(d)}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// A single show timing — Pending (interactive → entry) or Reported (read-only).
function ShowRow({ time, submitted, record, onEnter, onView, last }) {
  const border = last ? '' : 'border-b border-line'

  if (submitted) {
    return (
      <div className={`bg-success-soft/25 px-4 py-3 ${border}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IconClock width={16} height={16} className="text-success" />
            <span className="num text-[15px] font-semibold text-ink">{time}</span>
          </div>
          <StatusBadge tone="success" dot>
            Reported
          </StatusBadge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[26px] text-sm text-ink-soft">
          <span className="num">
            {formatCount(record.totalSold)} / {formatCount(record.totalSeats)} seats
          </span>
          <span className="num text-ink-faint">{formatPercent(record.occupancy)} occupancy</span>
          <span className="num font-semibold text-ink">{formatCurrency(record.actualCollection)}</span>
          <button
            type="button"
            onClick={onView}
            className="ml-auto text-xs font-semibold text-accent-ink underline-offset-2 hover:underline"
          >
            View report
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onEnter}
      className={`group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent-soft/30 focus-visible:bg-accent-soft/30 focus-visible:outline-none ${border}`}
    >
      <IconClock width={16} height={16} className="shrink-0 text-ink-faint group-hover:text-accent" />
      <span className="num text-[15px] font-semibold text-ink">{time}</span>
      <StatusBadge tone="warning" dot>
        Pending
      </StatusBadge>
      <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-accent-ink">
        <span className="hidden sm:inline">Enter sales</span>
        <IconChevronRight
          width={18}
          height={18}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </button>
  )
}

export default function TheatreDetailsPage() {
  const { theatreId } = useParams()
  const navigate = useNavigate()
  const { draft, startDraft, submissions } = useApp()
  const theatre = getTheatre(theatreId)
  const dates = getReportDates()
  const selectedDate = draft?.theatreId === theatreId && draft?.date ? draft.date : dates[0]

  // Ensure a draft exists scoped to this theatre + date (read-only context).
  useEffect(() => {
    if (!draft || draft.theatreId !== theatreId) {
      startDraft({ theatreId, date: dates[0], screenId: null, movieId: null, time: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theatreId])

  const screenGroups = useMemo(() => {
    if (!theatre) return []
    return theatre.screens.map((screen) => {
      const movie = getMovie(screen.movieId)
      const shows = screen.times.map((time) => {
        const key = reportKey({ theatreId, screenId: screen.id, movieId: screen.movieId, date: selectedDate, time })
        const record = submissions.find((s) => s.key === key)
        return { time, submitted: !!record, record }
      })
      return { screen, movie, shows, capacity: planCapacity(screen.plan) }
    })
  }, [theatre, theatreId, selectedDate, submissions])

  const pendingCount = useMemo(
    () => screenGroups.reduce((sum, g) => sum + g.shows.filter((s) => !s.submitted).length, 0),
    [screenGroups],
  )

  const enterShow = (screen, time) => {
    startDraft({ screenId: screen.id, movieId: screen.movieId, time })
    navigate('/entry')
  }

  if (!theatre) {
    return (
      <AppShell>
        <PageHeader title="Theatre not found" onBack={() => navigate('/theatres')} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <StepFlow current={0} />
      <PageHeader
        title={theatre.name}
        subtitle={`${theatre.location}, ${theatre.city}`}
        onBack={() => navigate('/theatres')}
        backLabel="Theatres"
      />

      {/* Read-only theatre reference */}
      <Card className="mb-5 animate-fade-in">
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <ReadOnlyField
            label="Theatre"
            lock
            value={
              <span className="flex items-center gap-2">
                <IconBuilding width={16} height={16} className="text-ink-faint" />
                {theatre.name}
              </span>
            }
          />
          <ReadOnlyField
            label="Location"
            lock
            value={
              <span className="flex items-center gap-2">
                <IconMapPin width={16} height={16} className="text-ink-faint" />
                {theatre.location}
              </span>
            }
          />
          <ReadOnlyField label="Screens" lock numeric value={theatre.screens.length} />
        </div>
      </Card>

      {/* Date context (default: today) */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Report date
          </p>
          {pendingCount > 0 ? (
            <span className="text-xs font-semibold text-warning-ink">
              {pendingCount} pending on this date
            </span>
          ) : (
            <span className="text-xs font-semibold text-success-ink">All reported</span>
          )}
        </div>
        <DateSelector dates={dates} value={selectedDate} onChange={(d) => startDraft({ date: d })} />
      </div>

      {/* Screens → movie → showtimes */}
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          Screens &amp; shows · {formatDate(selectedDate)}
        </p>
        <span className="flex items-center gap-1 text-[11px] font-medium text-ink-faint">
          <IconLock width={11} height={11} />
          reference
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {screenGroups.map(({ screen, movie, shows, capacity }) => (
          <Card key={screen.id} className="animate-fade-in overflow-hidden">
            {/* Screen → movie header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-accent-ink ring-1 ring-inset ring-line">
                  <IconFilm width={18} height={18} />
                </span>
                <div>
                  <div className="text-sm font-bold text-ink">{screen.name}</div>
                  <div className="num text-xs text-ink-faint">{formatCount(capacity)} seats</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink">{movie.title}</div>
                <div className="text-xs text-ink-soft">
                  {movie.language} · {movie.cert} · {movie.runtime}
                </div>
              </div>
            </div>

            {/* Show timings */}
            <div>
              {shows.map((show, i) => (
                <ShowRow
                  key={show.time}
                  time={show.time}
                  submitted={show.submitted}
                  record={show.record}
                  last={i === shows.length - 1}
                  onEnter={() => enterShow(screen, show.time)}
                  onView={() => navigate('/history')}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <StatusBadge tone="warning" dot>
            Pending
          </StatusBadge>
          tap to enter sales
        </span>
        <span className="flex items-center gap-1.5">
          <StatusBadge tone="success" dot>
            Reported
          </StatusBadge>
          already submitted · view only
        </span>
      </div>
    </AppShell>
  )
}
