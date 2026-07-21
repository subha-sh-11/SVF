import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AppShell, PageHeader } from '../components/Layout'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/Badge'
import { PrimaryButton, SecondaryButton } from '../components/Button'
import {
  IconBuilding,
  IconMapPin,
  IconFilm,
  IconChevronRight,
  IconList,
  IconClock,
} from '../components/icons'
import { getTheatresByIds, getReportDates, getMovie, reportKey } from '../data/mockData'
import { formatDate, formatCount } from '../utils/format'

// Count today's show slots per theatre and how many still need a report.
function useTheatreSummaries() {
  const { submissions, assignedTheatreIds } = useApp()
  const today = getReportDates()[0]
  return useMemo(() => {
    return getTheatresByIds(assignedTheatreIds).map((t) => {
      let totalShows = 0
      let submitted = 0
      const movieTitles = new Set()
      t.screens.forEach((screen) => {
        movieTitles.add(getMovie(screen.movieId)?.title)
        screen.times.forEach((time) => {
          totalShows += 1
          const key = reportKey({
            theatreId: t.id,
            screenId: screen.id,
            movieId: screen.movieId,
            date: today,
            time,
          })
          if (submissions.some((s) => s.key === key)) submitted += 1
        })
      })
      return {
        theatre: t,
        screens: t.screens.length,
        movies: [...movieTitles].filter(Boolean),
        totalShows,
        pending: totalShows - submitted,
      }
    })
  }, [submissions, assignedTheatreIds, today])
}

// Small labelled figure used inside the theatre card.
function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface-muted px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
        {label}
      </div>
      <div className="num mt-0.5 text-lg font-bold leading-none text-ink">{value}</div>
    </div>
  )
}

// The prominent amber "to-do" indicator — the rep's actual work.
function PendingIndicator({ pending, size = 'md' }) {
  if (pending === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3">
        <StatusBadge tone="success" dot>
          All done
        </StatusBadge>
        <span className="text-sm font-medium text-success-ink">
          Every show reported for today.
        </span>
      </div>
    )
  }
  const big = size === 'lg'
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3">
      <span
        className={`num flex shrink-0 items-center justify-center rounded-lg bg-warning text-white ${
          big ? 'h-14 w-14 text-2xl' : 'h-11 w-11 text-xl'
        } font-bold`}
      >
        {pending}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-warning-ink">
          {pending} show{pending > 1 ? 's' : ''} pending report
        </div>
        <div className="text-xs text-warning-ink/80">Awaiting your sales entry for today.</div>
      </div>
    </div>
  )
}

function MovieChips({ movies }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {movies.map((m) => (
        <span
          key={m}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
        >
          <IconFilm width={12} height={12} className="text-ink-faint" />
          {m}
        </span>
      ))}
    </div>
  )
}

function TheatreHeader({ theatre, pending }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
          <IconBuilding width={22} height={22} />
        </span>
        <div>
          <h3 className="text-base font-bold leading-tight text-ink sm:text-lg">{theatre.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <IconMapPin width={14} height={14} className="shrink-0 text-ink-faint" />
            {theatre.location}, {theatre.city}
          </p>
        </div>
      </div>
      {pending > 0 ? (
        <StatusBadge tone="warning" dot>
          {pending} pending
        </StatusBadge>
      ) : (
        <StatusBadge tone="success" dot>
          All done
        </StatusBadge>
      )}
    </div>
  )
}

// --- Single assigned theatre: one prominent card ---
function ProminentTheatreCard({ summary, onOpen }) {
  const { theatre, screens, movies, totalShows, pending } = summary
  return (
    <Card className="animate-slide-up overflow-hidden">
      <div className="p-5 sm:p-6">
        <TheatreHeader theatre={theatre} pending={pending} />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Movies running
              </div>
              <MovieChips movies={movies} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Screens" value={screens} />
              <MiniStat label="Shows today" value={totalShows} />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <PendingIndicator pending={pending} size="lg" />
            <PrimaryButton className="w-full" onClick={onOpen}>
              Open theatre
              <IconChevronRight width={18} height={18} />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Card>
  )
}

// --- Two theatres: compact, clickable cards that stack ---
function CompactTheatreCard({ summary, onOpen }) {
  const { theatre, screens, movies, totalShows, pending } = summary
  return (
    <Card
      as="button"
      interactive
      onClick={onOpen}
      className="flex animate-fade-in flex-col text-left"
    >
      <div className="p-5">
        <TheatreHeader theatre={theatre} pending={pending} />
        <div className="mt-4">
          <PendingIndicator pending={pending} />
        </div>
        <div className="mt-4">
          <MovieChips movies={movies} />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line px-5 py-3">
        <div className="flex gap-5 text-sm text-ink-soft">
          <span className="flex items-center gap-1">
            <IconBuilding width={14} height={14} className="text-ink-faint" />
            <span className="num font-bold text-ink">{screens}</span> screens
          </span>
          <span className="flex items-center gap-1">
            <IconClock width={14} height={14} className="text-ink-faint" />
            <span className="num font-bold text-ink">{totalShows}</span> shows today
          </span>
        </div>
        <span className="flex items-center gap-0.5 text-sm font-semibold text-accent-ink">
          Open
          <IconChevronRight width={16} height={16} />
        </span>
      </div>
    </Card>
  )
}

export default function TheatresPage() {
  const navigate = useNavigate()
  const { representative } = useApp()
  const summaries = useTheatreSummaries()
  const today = getReportDates()[0]
  const single = summaries.length === 1

  const totalPending = summaries.reduce((sum, s) => sum + s.pending, 0)

  return (
    <AppShell>
      <PageHeader
        title={`Welcome, ${representative.name.split(' ')[0]}`}
        subtitle={
          totalPending > 0
            ? `You have ${totalPending} show report${totalPending > 1 ? 's' : ''} pending · ${formatDate(today)}`
            : `All caught up · ${formatDate(today)}`
        }
        right={
          <SecondaryButton size="md" onClick={() => navigate('/history')}>
            <IconList width={18} height={18} />
            History
          </SecondaryButton>
        }
      />

      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          {single ? 'Your assigned theatre' : `Your assigned theatres · ${summaries.length}`}
        </p>
      </div>

      {single ? (
        <ProminentTheatreCard
          summary={summaries[0]}
          onOpen={() => navigate(`/theatres/${summaries[0].theatre.id}`)}
        />
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2">
          {summaries.map((summary) => (
            <CompactTheatreCard
              key={summary.theatre.id}
              summary={summary}
              onOpen={() => navigate(`/theatres/${summary.theatre.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
