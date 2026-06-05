import { formatValue, formatChange } from '../lib/format'

export function KpiCard({ kpi }) {
  const hasChange = kpi.change != null

  return (
    <div className="card kpi-card">
      <span className="kpi-label">{kpi.label}</span>
      <span className="kpi-value">{formatValue(kpi.value, kpi.format)}</span>
      {hasChange ? (
        <span className={`kpi-change ${kpi.change >= 0 ? 'up' : 'down'}`}>
          {kpi.change >= 0 ? '▲' : '▼'} {formatChange(kpi.change)}
          <span className="kpi-change-period">vs last period</span>
        </span>
      ) : kpi.hint ? (
        <span className={`kpi-hint tone-${kpi.tone || 'muted'}`}>{kpi.hint}</span>
      ) : null}
    </div>
  )
}
