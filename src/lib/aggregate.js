// Derives dashboard view models from flat data rows. All metrics the UI
// shows are computed here, so the data sources only have to return raw rows
// and never need to know about charts or KPIs.
//
// Domain builders: buildViewModel (outreach) and buildExpensesModel
// (finance) — see README "Adding a business section".

function isYes(value) {
  return String(value || '').trim().toLowerCase().startsWith('yes')
}

function countBy(items, keyFn) {
  const counts = new Map()
  for (const item of items) {
    const key = keyFn(item) || 'Unknown'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

// Map -> sorted [{ name, value }] for charts.
function toBreakdown(counts) {
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function buildViewModel(contacts = []) {
  const total = contacts.length

  const sent = contacts.filter((c) => String(c.dateSent || '').trim() !== '')
  const scored = contacts
    .map((c) => Number(c.contactScore))
    .filter((n) => Number.isFinite(n) && n > 0)
  const avgScore = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : 0
  const needsReview = contacts.filter((c) => isYes(c.humanReviewNeeded)).length
  const companies = new Set(contacts.map((c) => c.company).filter(Boolean)).size
  const pctSent = total ? Math.round((sent.length / total) * 100) : 0

  const kpis = [
    {
      id: 'total',
      label: 'Total Contacts',
      value: total,
      format: 'number',
      hint: `${companies} companies`,
    },
    {
      id: 'sent',
      label: 'Outreach Sent',
      value: sent.length,
      format: 'number',
      hint: `${pctSent}% of contacts`,
    },
    {
      id: 'avgScore',
      label: 'Avg Contact Score',
      value: avgScore,
      format: 'number',
      hint: `${scored.length} scored`,
    },
    {
      id: 'review',
      label: 'Needs Review',
      value: needsReview,
      format: 'number',
      hint: needsReview ? 'action required' : 'all clear',
      tone: needsReview ? 'warning' : 'positive',
    },
  ]

  return {
    kpis,
    statusBreakdown: toBreakdown(countBy(contacts, (c) => c.outreachStatus)),
    sourceBreakdown: toBreakdown(countBy(contacts, (c) => c.source)),
    contacts,
  }
}

// ---------------------------------------------------------------------------
// FINANCE domain
// ---------------------------------------------------------------------------

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// 'YYYY-MM' key for grouping, or null when the date doesn't parse.
function monthKey(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-')
  return `${MONTH_LABELS[Number(month) - 1]} ’${year.slice(2)}`
}

function sumAmounts(expenses) {
  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
}

/**
 * Turns raw expense rows ({ date, category, vendor, description, amount })
 * into the finance section's view model: KPIs, monthly spend series,
 * category breakdown, and a date-sorted transaction list.
 *
 * "This month" means the latest month present in the data (not the wall
 * clock), so the section stays meaningful for books that lag a few days.
 */
export function buildExpensesModel(expenses = []) {
  const totalSpend = sumAmounts(expenses)

  // Group into months, sorted oldest -> newest for the trend chart.
  const byMonth = new Map()
  for (const e of expenses) {
    const key = monthKey(e.date)
    if (!key) continue
    byMonth.set(key, (byMonth.get(key) || 0) + (Number(e.amount) || 0))
  }
  const monthKeys = [...byMonth.keys()].sort()
  const monthlySeries = monthKeys.map((key) => ({
    name: monthLabel(key),
    value: Math.round(byMonth.get(key)),
  }))

  const latestKey = monthKeys[monthKeys.length - 1]
  const prevKey = monthKeys[monthKeys.length - 2]
  const latestSpend = latestKey ? byMonth.get(latestKey) : 0
  const prevSpend = prevKey ? byMonth.get(prevKey) : 0
  const monthChange = prevSpend
    ? Math.round(((latestSpend - prevSpend) / prevSpend) * 100)
    : null
  const avgMonthly = monthKeys.length ? totalSpend / monthKeys.length : 0

  // Spend per category, largest first (also feeds the donut).
  const byCategory = new Map()
  for (const e of expenses) {
    const key = e.category || 'Uncategorized'
    byCategory.set(key, (byCategory.get(key) || 0) + (Number(e.amount) || 0))
  }
  const categoryBreakdown = [...byCategory.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
  const topCategory = categoryBreakdown[0]

  const kpis = [
    {
      id: 'totalSpend',
      label: 'Total Spend',
      value: Math.round(totalSpend),
      format: 'currency',
      hint: `${expenses.length} transactions`,
    },
    {
      id: 'monthSpend',
      label: latestKey ? `Spend · ${monthLabel(latestKey)}` : 'Spend This Month',
      value: Math.round(latestSpend),
      format: 'currency',
      // Spend going up is bad — invertChange colors increases red.
      ...(monthChange != null
        ? { change: monthChange, invertChange: true }
        : { hint: 'no prior month to compare' }),
    },
    {
      id: 'avgMonthly',
      label: 'Avg Monthly Spend',
      value: Math.round(avgMonthly),
      format: 'currency',
      hint: `over ${monthKeys.length} month${monthKeys.length === 1 ? '' : 's'}`,
    },
    {
      id: 'topCategory',
      label: 'Top Category',
      value: topCategory ? topCategory.value : 0,
      format: 'currency',
      hint: topCategory ? topCategory.name : '—',
    },
  ]

  return {
    kpis,
    monthlySeries,
    categoryBreakdown,
    expenses: [...expenses].sort((a, b) => String(b.date).localeCompare(String(a.date))),
  }
}
