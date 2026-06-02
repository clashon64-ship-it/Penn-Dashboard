// Derives the dashboard view model from a flat list of contacts. All metrics
// the UI shows are computed here, so the data source only has to return raw
// contacts and never needs to know about charts or KPIs.

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
