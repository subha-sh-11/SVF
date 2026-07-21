import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AppShell, PageHeader, StepFlow, StickyActionBar } from '../components/Layout'
import { Card, SectionLabel } from '../components/Card'
import { OptionTile, TimeChip } from '../components/Select'
import { ReadOnlyField } from '../components/ReadOnlyField'
import { PrimaryButton } from '../components/Button'
import { StatusBadge } from '../components/Badge'
import { IconFilm, IconClock } from '../components/icons'
import {
  getTheatre,
  getMovie,
  getReportDates,
  reportKey,
  planCapacity,
  planMaxCollection,
} from '../data/mockData'
import { formatDate, formatCount, formatCurrency } from '../utils/format'

export default function ShowSelectionPage() {
  const { theatreId } = useParams()
  const navigate = useNavigate()
  const { draft, startDraft, submissions } = useApp()
  const theatre = getTheatre(theatreId)
  const date = draft?.date || getReportDates()[0]

  const [screenId, setScreenId] = useState(draft?.screenId || null)
  const [time, setTime] = useState(draft?.time || null)

  useEffect(() => {
    if (!theatre) navigate('/theatres', { replace: true })
  }, [theatre, navigate])

  const screen = useMemo(
    () => theatre?.screens.find((s) => s.id === screenId) || null,
    [theatre, screenId],
  )
  const movie = screen ? getMovie(screen.movieId) : null

  const timeStatuses = useMemo(() => {
    if (!screen) return []
    return screen.times.map((t) => {
      const key = reportKey({ theatreId, screenId: screen.id, movieId: screen.movieId, date, time: t })
      return { time: t, submitted: submissions.some((s) => s.key === key) }
    })
  }, [screen, theatreId, date, submissions])

  const canContinue = screen && time
  const selectedSubmitted = timeStatuses.find((t) => t.time === time)?.submitted

  const proceed = () => {
    if (!canContinue || selectedSubmitted) return
    startDraft({ screenId: screen.id, movieId: screen.movieId, time })
    navigate('/entry')
  }

  if (!theatre) return null

  return (
    <AppShell>
      <StepFlow current={1} />
      <PageHeader
        title="Select a show"
        subtitle={`${theatre.name} · ${formatDate(date)}`}
        onBack={() => navigate(`/theatres/${theatreId}`)}
        backLabel={theatre.name}
      />

      {/* Step 1 — screen (with its movie) */}
      <SectionLabel className="mb-2.5">1 · Screen &amp; movie</SectionLabel>
      <div className="mb-6 grid gap-3">
        {theatre.screens.map((s) => {
          const m = getMovie(s.movieId)
          return (
            <OptionTile
              key={s.id}
              selected={screenId === s.id}
              onClick={() => {
                setScreenId(s.id)
                setTime(null)
              }}
              icon={<IconFilm width={20} height={20} />}
              title={`${s.name} — ${m.title}`}
              meta={`${m.language} · ${m.cert} · ${formatCount(planCapacity(s.plan))} seats`}
            />
          )
        })}
      </div>

      {/* Step 2 — movie summary (read-only, derived from screen) */}
      {screen && (
        <div className="mb-6 animate-fade-in">
          <SectionLabel className="mb-2.5">2 · Movie details</SectionLabel>
          <Card>
            <div className="grid gap-3 p-5 sm:grid-cols-4">
              <ReadOnlyField label="Movie" lock value={movie.title} className="sm:col-span-2" />
              <ReadOnlyField label="Language" lock value={movie.language} />
              <ReadOnlyField label="Certificate" lock value={movie.cert} />
              <ReadOnlyField label="Runtime" lock value={movie.runtime} />
              <ReadOnlyField label="Capacity" lock numeric value={formatCount(planCapacity(screen.plan))} />
              <ReadOnlyField
                label="Max collection"
                lock
                numeric
                value={formatCurrency(planMaxCollection(screen.plan))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Step 3 — show timing */}
      {screen && (
        <div className="animate-fade-in">
          <SectionLabel className="mb-2.5">3 · Show timing</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {timeStatuses.map(({ time: t, submitted }) => (
              <div key={t} className="flex flex-col items-stretch gap-1">
                <TimeChip
                  selected={time === t}
                  disabled={submitted}
                  onClick={() => setTime(t)}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconClock width={14} height={14} />
                    {t}
                  </span>
                </TimeChip>
                {submitted && (
                  <span className="text-center text-[11px] font-semibold text-success-ink">
                    Reported
                  </span>
                )}
              </div>
            ))}
          </div>
          {selectedSubmitted && (
            <div className="mt-3">
              <StatusBadge tone="warning">
                This show is already reported — pick another timing.
              </StatusBadge>
            </div>
          )}
        </div>
      )}

      <StickyActionBar>
        <PrimaryButton
          className="w-full"
          disabled={!canContinue || selectedSubmitted}
          onClick={proceed}
        >
          {canContinue ? 'Continue to sales entry' : 'Select screen & timing'}
        </PrimaryButton>
      </StickyActionBar>
    </AppShell>
  )
}
