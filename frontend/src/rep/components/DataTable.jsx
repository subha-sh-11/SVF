// DataTable — a real table on wider viewports, and stacked labelled
// cards below ~640px (never a horizontally-scrolling table on phones).
//
// columns: [{ key, header, align?: 'left'|'right', numeric?, render(row),
//             headerHint?, className?, mobilePrimary?, hideOnMobile? }]
// totals:  optional emphasised footer row — { cells: { [key]: node }, label? }

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function DataTable({ columns, rows, getRowKey, totals, caption, className }) {
  const primaryCol = columns.find((c) => c.mobilePrimary) || columns[0]
  const detailCols = columns.filter((c) => c !== primaryCol && !c.hideOnMobile)

  return (
    <div className={className}>
      {/* ---- Wide viewport: real table ---- */}
      <div className="hidden overflow-hidden rounded-xl border border-line sm:block">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-surface-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(
                    'border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint',
                    col.numeric || col.align === 'right' ? 'text-right' : 'text-left',
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={getRowKey ? getRowKey(row, i) : i} className="bg-surface">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx(
                      'border-b border-line px-4 py-3 text-ink',
                      col.numeric || col.align === 'right' ? 'num text-right tabular-nums' : 'text-left',
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="bg-accent-soft/40">
                {columns.map((col, ci) => (
                  <td
                    key={col.key}
                    className={cx(
                      'border-t-2 border-line-strong px-4 py-3 font-semibold text-ink',
                      col.numeric || col.align === 'right' ? 'num text-right tabular-nums' : 'text-left',
                    )}
                  >
                    {ci === 0 && totals.label && !(col.key in totals.cells) ? totals.label : null}
                    {col.key in totals.cells ? totals.cells[col.key] : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ---- Narrow viewport: stacked labelled cards ---- */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row, i) => (
          <div
            key={getRowKey ? getRowKey(row, i) : i}
            className="rounded-xl border border-line bg-surface p-4 shadow-card"
          >
            <div className="mb-2 border-b border-line pb-2 text-sm font-semibold text-ink">
              {primaryCol.render ? primaryCol.render(row) : row[primaryCol.key]}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {detailCols.map((col) => (
                <div key={col.key} className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
                    {col.header}
                  </dt>
                  <dd
                    className={cx(
                      'text-sm text-ink',
                      col.numeric || col.align === 'right' ? 'num tabular-nums' : '',
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {totals && (
          <div className="rounded-xl border-2 border-line-strong bg-accent-soft/40 p-4">
            <div className="mb-2 text-sm font-semibold text-ink">{totals.label || 'Total'}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {detailCols
                .filter((col) => col.key in totals.cells)
                .map((col) => (
                  <div key={col.key} className="flex flex-col gap-0.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
                      {col.header}
                    </dt>
                    <dd
                      className={cx(
                        'text-sm font-semibold text-ink',
                        col.numeric || col.align === 'right' ? 'num tabular-nums' : '',
                      )}
                    >
                      {totals.cells[col.key]}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}
