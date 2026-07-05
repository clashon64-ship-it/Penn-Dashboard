import { sampleContacts, sampleExpenses } from './sampleData'

// The dashboard reads from the backend proxy (a same-origin Vercel serverless
// function in production, or a local proxy in dev) which holds the Google
// service-account credentials and keeps the sheet private. When no proxy URL is
// configured it falls back to the built-in sample contacts.
//
// In production, .env.production sets VITE_API_BASE_URL=/api so the app calls
// the co-deployed serverless function at the same origin.
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export const dataSource = BASE_URL ? 'api' : 'sample'
export const usingSampleData = dataSource === 'sample'

// Simulate latency so loading states are exercised against sample data.
function delay(value, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Generic GET against the proxy. Each business domain gets a thin fetcher built
 * on this (e.g. fetchContacts below). To add a new domain — say expenses — add
 * an `api/expenses.js` serverless function and a `fetchExpenses()` one-liner
 * here, then aggregate + render it. See README "Adding a business section".
 */
async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Proxy request to ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * Outreach domain: fetch the raw contact list from the active data source.
 *
 * - `api`:    GET {BASE_URL}/dashboard  ->  { contacts: [...] }
 * - `sample`: built-in fictional contacts
 *
 * Returns a normalized array of contacts; aggregation happens in
 * src/lib/aggregate.js so the source stays dumb.
 */
export async function fetchContacts() {
  if (dataSource === 'sample') {
    return delay(sampleContacts)
  }
  const body = await fetchJson('/dashboard')
  return body.contacts || []
}

/**
 * Finance domain: fetch raw expense rows from the active data source.
 *
 * - `api`:    GET {BASE_URL}/expenses  ->  { available, expenses: [...] }
 * - `sample`: built-in fictional expenses
 *
 * `available` is false when the sheet has no Expenses tab yet, letting the
 * Finance section show its setup placeholder instead of an error.
 */
export async function fetchExpenses() {
  if (dataSource === 'sample') {
    return delay({ available: true, expenses: sampleExpenses })
  }
  const body = await fetchJson('/expenses')
  return { available: body.available !== false, expenses: body.expenses || [] }
}
