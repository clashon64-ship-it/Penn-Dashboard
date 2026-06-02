// Built-in sample dataset. Used when VITE_API_BASE_URL is not configured so the
// dashboard renders immediately during development. The shape here is the
// contract the rest of the app expects an external API to return.

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function buildTimeseries() {
  let revenue = 420000
  let expenses = 310000
  return MONTHS.map((month) => {
    revenue += Math.round((Math.random() - 0.35) * 60000)
    expenses += Math.round((Math.random() - 0.45) * 40000)
    revenue = Math.max(revenue, 200000)
    expenses = Math.max(expenses, 150000)
    return {
      month,
      revenue,
      expenses,
      profit: revenue - expenses,
    }
  })
}

const timeseries = buildTimeseries()
const totalRevenue = timeseries.reduce((sum, p) => sum + p.revenue, 0)
const totalProfit = timeseries.reduce((sum, p) => sum + p.profit, 0)
const last = timeseries[timeseries.length - 1]
const prev = timeseries[timeseries.length - 2]

function pctChange(current, previous) {
  if (!previous) return 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export const sampleData = {
  kpis: [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: totalRevenue,
      format: 'currency',
      change: pctChange(last.revenue, prev.revenue),
    },
    {
      id: 'profit',
      label: 'Net Profit',
      value: totalProfit,
      format: 'currency',
      change: pctChange(last.profit, prev.profit),
    },
    {
      id: 'margin',
      label: 'Profit Margin',
      value: Number(((totalProfit / totalRevenue) * 100).toFixed(1)),
      format: 'percent',
      change: pctChange(
        last.profit / last.revenue,
        prev.profit / prev.revenue,
      ),
    },
    {
      id: 'customers',
      label: 'Active Customers',
      value: 1284,
      format: 'number',
      change: 4.2,
    },
  ],
  timeseries,
  categories: [
    { name: 'Enterprise', value: 1240000 },
    { name: 'Mid-Market', value: 860000 },
    { name: 'SMB', value: 540000 },
    { name: 'Self-Serve', value: 320000 },
  ],
  transactions: [
    { id: 'TX-10428', customer: 'Northwind Capital', amount: 84200, status: 'paid', date: '2026-05-28' },
    { id: 'TX-10427', customer: 'Sterling & Co', amount: 41750, status: 'pending', date: '2026-05-27' },
    { id: 'TX-10426', customer: 'Atlas Ventures', amount: 128900, status: 'paid', date: '2026-05-26' },
    { id: 'TX-10425', customer: 'Birch Holdings', amount: 19400, status: 'failed', date: '2026-05-25' },
    { id: 'TX-10424', customer: 'Cedar Group', amount: 67300, status: 'paid', date: '2026-05-24' },
    { id: 'TX-10423', customer: 'Dahlia Partners', amount: 53850, status: 'pending', date: '2026-05-23' },
  ],
}
