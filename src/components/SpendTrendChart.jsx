import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatValue, formatCompactCurrency } from '../lib/format'

/**
 * Monthly spend bar chart for the finance section. Takes the
 * [{ name, value }] monthly series from buildExpensesModel.
 */
export function SpendTrendChart({ data }) {
  return (
    <div className="card chart-card">
      <h3 className="card-title">Monthly Spend</h3>
      {data.length === 0 ? (
        <p className="empty">No dated expenses yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8b93a7', fontSize: 12 }}
              axisLine={{ stroke: '#2a2f3a' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fill: '#8b93a7', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ fill: 'rgba(79, 140, 255, 0.08)' }}
              contentStyle={{
                background: '#1f232c',
                border: '1px solid #2a2f3a',
                borderRadius: 8,
                color: '#e6e9ef',
              }}
              formatter={(value) => [formatValue(value, 'currency'), 'Spend']}
            />
            <Bar dataKey="value" fill="#4f8cff" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
