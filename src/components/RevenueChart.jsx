import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency } from '../lib/format'

export function RevenueChart({ data }) {
  return (
    <div className="card chart-card">
      <h3 className="card-title">Revenue vs. Expenses</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#4f8cff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis dataKey="month" stroke="#9aa3b2" fontSize={12} />
          <YAxis
            stroke="#9aa3b2"
            fontSize={12}
            tickFormatter={formatCompactCurrency}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: '#1f232c',
              border: '1px solid #2a2f3a',
              borderRadius: 8,
              color: '#e6e9ef',
            }}
            formatter={(value) => formatCompactCurrency(value)}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4f8cff"
            strokeWidth={2}
            fill="url(#revFill)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#f87171"
            strokeWidth={2}
            fill="url(#expFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
