// Minimal inline SVG icon set (no external icon dependency).
// All icons inherit `currentColor` and accept standard svg props.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const make = (paths) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {paths}
      </svg>
    )
  }

export const IconPhone = make(
  <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />,
)
export const IconShield = make(
  <>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
)
export const IconBuilding = make(
  <>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
  </>,
)
export const IconFilm = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
  </>,
)
export const IconTicket = make(
  <>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" />
    <path d="M14 6v2M14 11v2M14 16v0" />
  </>,
)
export const IconClock = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4l2.5 1.5" />
  </>,
)
export const IconCheck = make(<path d="m5 12 4.5 4.5L19 7" />)
export const IconCheckCircle = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </>,
)
export const IconChevronRight = make(<path d="m9 6 6 6-6 6" />)
export const IconChevronLeft = make(<path d="m15 6-6 6 6 6" />)
export const IconArrowLeft = make(<path d="M19 12H5m6-6-6 6 6 6" />)
export const IconAlert = make(
  <>
    <path d="M12 3.5 21 19H3L12 3.5Z" />
    <path d="M12 10v4M12 17v0" />
  </>,
)
export const IconClose = make(<path d="M6 6l12 12M18 6 6 18" />)
export const IconLock = make(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>,
)
export const IconMapPin = make(
  <>
    <path d="M12 21c4-4 7-7.5 7-11a7 7 0 1 0-14 0c0 3.5 3 7 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
)
export const IconList = make(<path d="M8 6h12M8 12h12M8 18h12M4 6v0M4 12v0M4 18v0" />)
export const IconLogout = make(
  <>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 12h10m-3-3 3 3-3 3" />
  </>,
)
export const IconUsers = make(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.4-4.5" />
  </>,
)
export const IconGauge = make(
  <>
    <path d="M4 15a8 8 0 1 1 16 0" />
    <path d="m12 15 3.5-3.5" />
    <path d="M4 15h1M19 15h1M12 7v1" />
  </>,
)
