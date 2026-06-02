import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCompactCurrency } from '../lib/format'

const COLORS = ['#4f8cff', '#34d399', '#fbbf24', '#a78bfa']

export function CategoryChart({ data }) {
  return (
    <div className="card chart-card">
      <h3 className="card-title">Revenue by Segment</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1f232c',
              border: '1px solid #2a2f3a',
              borderRadius: 8,
              color: '#e6e9ef',
            }}
            formatter={(value) => formatCompactCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="legend">
        {data.map((entry, index) => (
          <li key={entry.name}>
            <span
              className="legend-dot"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            {entry.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
