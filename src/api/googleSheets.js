// Google Sheets data source.
//
// Reads the dashboard data from a Google Spreadsheet using the Sheets API v4.
// The spreadsheet must be shared so "Anyone with the link can view", and the
// API key must have the Google Sheets API enabled (restrict it to your domain
// in production).
//
// Expected tabs (configurable via env). The FIRST row of each tab is a header
// row; remaining rows are records.
//
//   KPIs          id | label | value | format | change
//   Timeseries    month | revenue | expenses | profit
//   Categories    name | value
//   Transactions  id | customer | amount | status | date
//
// `format` is one of currency | percent | number.
// `status` is one of paid | pending | failed.

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || ''
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

export const usingGoogleSheets = Boolean(SHEET_ID && API_KEY)

const TABS = {
  kpis: import.meta.env.VITE_SHEET_TAB_KPIS || 'KPIs',
  timeseries: import.meta.env.VITE_SHEET_TAB_TIMESERIES || 'Timeseries',
  categories: import.meta.env.VITE_SHEET_TAB_CATEGORIES || 'Categories',
  transactions: import.meta.env.VITE_SHEET_TAB_TRANSACTIONS || 'Transactions',
}

// Order the ranges are requested in; results come back in the same order.
const RANGE_ORDER = ['kpis', 'timeseries', 'categories', 'transactions']

function parseNumber(raw) {
  if (raw == null || raw === '') return 0
  // Tolerate values like "$1,240,000", "12.5%", "1 284".
  const cleaned = String(raw).replace(/[$,%\s]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

// Turn a sheet's 2D value array into objects keyed by the header row.
// Headers are lowercased so the sheet can use "Label" or "label".
function rowsToObjects(values) {
  if (!values || values.length < 2) return []
  const headers = values[0].map((h) => String(h).trim().toLowerCase())
  return values.slice(1).map((row) => {
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? ''
    })
    return obj
  })
}

function mapKpis(rows) {
  return rows.map((r) => ({
    id: r.id || r.label,
    label: r.label,
    value: parseNumber(r.value),
    format: r.format || 'number',
    change: parseNumber(r.change),
  }))
}

function mapTimeseries(rows) {
  return rows.map((r) => {
    const revenue = parseNumber(r.revenue)
    const expenses = parseNumber(r.expenses)
    return {
      month: r.month,
      revenue,
      expenses,
      // Use the sheet's profit column if present, otherwise derive it.
      profit: r.profit !== '' && r.profit != null
        ? parseNumber(r.profit)
        : revenue - expenses,
    }
  })
}

function mapCategories(rows) {
  return rows.map((r) => ({
    name: r.name,
    value: parseNumber(r.value),
  }))
}

function mapTransactions(rows) {
  return rows.map((r) => ({
    id: r.id,
    customer: r.customer,
    amount: parseNumber(r.amount),
    status: (r.status || '').toLowerCase(),
    date: r.date,
  }))
}

/**
 * Fetch all dashboard tabs in a single batchGet request and normalize them
 * into the payload shape the dashboard components consume.
 */
export async function fetchFromGoogleSheets() {
  const params = new URLSearchParams()
  RANGE_ORDER.forEach((key) => params.append('ranges', TABS[key]))
  params.set('majorDimension', 'ROWS')
  params.set('key', API_KEY)

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${params}`
  const res = await fetch(url)

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error?.message) detail = body.error.message
    } catch {
      // response wasn't JSON; keep the status text
    }
    throw new Error(`Google Sheets request failed: ${detail}`)
  }

  const body = await res.json()
  const ranges = body.valueRanges || []

  // Pair each requested range with its result by position.
  const byKey = {}
  RANGE_ORDER.forEach((key, i) => {
    byKey[key] = rowsToObjects(ranges[i]?.values)
  })

  return {
    kpis: mapKpis(byKey.kpis),
    timeseries: mapTimeseries(byKey.timeseries),
    categories: mapCategories(byKey.categories),
    transactions: mapTransactions(byKey.transactions),
  }
}
