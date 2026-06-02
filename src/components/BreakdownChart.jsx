import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = [
  '#4f8cff', '#34d399', '#fbbf24', '#a78bfa',
  '#f87171', '#22d3ee', '#f472b6', '#94a3b8',
]

/**
 * Generic donut chart for a [{ name, value }] breakdown. Used for both the
 * outreach-status and lead-source views.
 */
export function BreakdownChart({ title, data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="card chart-card">
      <h3 className="card-title">{title}</h3>
      {data.length === 0 ? (
        <p className="empty">No data yet.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
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
                formatter={(value, name) => [
                  `${value} (${Math.round((value / total) * 100)}%)`,
                  name,
                ]}
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
                <span className="legend-value">{entry.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
