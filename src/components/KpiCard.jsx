import { formatValue, formatChange } from '../lib/format'

export function KpiCard({ kpi }) {
  const positive = kpi.change >= 0
  return (
    <div className="card kpi-card">
      <span className="kpi-label">{kpi.label}</span>
      <span className="kpi-value">{formatValue(kpi.value, kpi.format)}</span>
      <span className={`kpi-change ${positive ? 'up' : 'down'}`}>
        {positive ? '▲' : '▼'} {formatChange(kpi.change)}
        <span className="kpi-change-period">vs last month</span>
      </span>
    </div>
  )
}
