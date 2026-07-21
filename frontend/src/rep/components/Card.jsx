// Card — white surface, soft border, gentle elevation.

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Card({ as: Tag = 'div', className, interactive, children, ...props }) {
  return (
    <Tag
      className={cx(
        'rounded-xl border border-line bg-surface shadow-card',
        interactive &&
          'cursor-pointer transition-all hover:border-line-strong hover:shadow-pop focus-visible:shadow-focus focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, icon, action, className }) {
  return (
    <div className={cx('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cx('p-5', className)}>{children}</div>
}

export function SectionLabel({ children, className }) {
  return (
    <p
      className={cx(
        'text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint',
        className,
      )}
    >
      {children}
    </p>
  )
}
