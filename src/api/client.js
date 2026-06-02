import { sampleData } from './sampleData'
import { usingGoogleSheets, fetchFromGoogleSheets } from './googleSheets'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const TOKEN = import.meta.env.VITE_API_TOKEN || ''

// Resolve the active data source once. Google Sheets takes precedence, then a
// generic REST API, then the built-in sample data.
export const dataSource = usingGoogleSheets ? 'sheets' : BASE_URL ? 'api' : 'sample'
export const usingSampleData = dataSource === 'sample'

function authHeaders() {
  const headers = { Accept: 'application/json' }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  return headers
}

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() })
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// Simulate network latency so loading states are exercised against sample data.
function delay(value, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Fetch the full dashboard payload from the active data source.
 *
 * - `sheets`: reads from a Google Spreadsheet (see api/googleSheets.js)
 * - `api`: expects a `GET /dashboard` endpoint at VITE_API_BASE_URL
 * - `sample`: returns the built-in dataset
 *
 * All paths resolve to the same { kpis, timeseries, categories, transactions }
 * shape, so the components never need to know where the data came from.
 */
export async function fetchDashboard() {
  if (dataSource === 'sheets') return fetchFromGoogleSheets()
  if (dataSource === 'api') return request('/dashboard')
  return delay(sampleData)
}
