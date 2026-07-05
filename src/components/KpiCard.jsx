import { formatValue, formatChange } from '../lib/format'

export function KpiCard({ kpi }) {
  const hasChange = kpi.change != null
  // The arrow always shows direction; the color shows whether that's good.
  // invertChange marks metrics where an increase is bad (e.g. spend).
  const increased = kpi.change >= 0
  const isGood = kpi.invertChange ? !increased : increased

  return (
    <div className="card kpi-card">
      <span className="kpi-label">{kpi.label}</span>
      <span className="kpi-value">{formatValue(kpi.value, kpi.format)}</span>
      {hasChange ? (
        <span className={`kpi-change ${isGood ? 'up' : 'down'}`}>
          {increased ? '▲' : '▼'} {formatChange(kpi.change)}
          <span className="kpi-change-period">vs last period</span>
        </span>
      ) : kpi.hint ? (
        <span className={`kpi-hint tone-${kpi.tone || 'muted'}`}>{kpi.hint}</span>
      ) : null}
    </div>
  )
}
