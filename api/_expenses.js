// Shared Expenses-tab reader used by both the Vercel serverless function
// (api/expenses.js) and the standalone Express server (server/index.js).
// Mirrors api/_sheet.js (same service-account auth, same caching) but reads
// the FINANCE domain: an `Expenses` tab of business spend rows.
//
// If the sheet has no Expenses tab yet, this reports { available: false }
// instead of erroring, so the dashboard can show its "add an Expenses tab"
// placeholder rather than a failure banner.

import { google } from 'googleapis'
import { getAuth, toNumber } from './_sheet.js'

const EXPENSES_RANGE = process.env.EXPENSES_RANGE || 'Expenses!A:E'
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60)

// Column order in the Expenses tab (A -> E). Keep in sync with EXPENSES_RANGE.
export const EXPENSE_COLUMNS = ['date', 'category', 'vendor', 'description', 'amount']

function rowToExpense(row) {
  const expense = {}
  EXPENSE_COLUMNS.forEach((key, i) => {
    const value = row[i] ?? ''
    expense[key] = key === 'amount' ? toNumber(value) : String(value).trim()
  })
  return expense
}

// The Sheets API rejects the whole request when the named tab doesn't exist.
function isMissingTab(err) {
  return /unable to parse range/i.test(err?.message || '')
}

let cache = { at: 0, result: null }

/**
 * Read the Expenses tab and return { available, expenses }. `available` is
 * false when the tab doesn't exist yet. Cached like loadContacts.
 */
export async function loadExpenses() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEET_ID')

  const fresh = Date.now() - cache.at < CACHE_TTL_SECONDS * 1000
  if (cache.result && fresh) return cache.result

  const sheets = google.sheets({ version: 'v4', auth: getAuth() })
  let data
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: EXPENSES_RANGE,
    })
    data = response.data
  } catch (err) {
    if (isMissingTab(err)) {
      cache = { at: Date.now(), result: { available: false, expenses: [] } }
      return cache.result
    }
    throw err
  }

  const rows = data.values || []
  // Drop the header row, then ignore rows with no date and no vendor.
  const expenses = rows
    .slice(1)
    .filter((r) => r.length && (r[0] || r[2]))
    .map(rowToExpense)

  cache = { at: Date.now(), result: { available: true, expenses } }
  return cache.result
}
