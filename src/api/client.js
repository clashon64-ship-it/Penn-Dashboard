import { sampleContacts } from './sampleData'

// The dashboard reads from the private backend proxy (which holds the Google
// service-account credentials and keeps the sheet private). When no proxy URL
// is configured it falls back to the built-in sample contacts.
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export const dataSource = BASE_URL ? 'api' : 'sample'
export const usingSampleData = dataSource === 'sample'

// Simulate latency so loading states are exercised against sample data.
function delay(value, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Fetch the raw contact list from the active data source.
 *
 * - `api`:    GET {VITE_API_BASE_URL}/dashboard  ->  { contacts: [...] }
 * - `sample`: built-in fictional contacts
 *
 * Returns a normalized array of contacts; aggregation happens in
 * src/lib/aggregate.js so the source stays dumb.
 */
export async function fetchContacts() {
  if (dataSource === 'sample') {
    return delay(sampleContacts)
  }

  const res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Proxy request failed: ${res.status} ${res.statusText}`)
  }
  const body = await res.json()
  return body.contacts || []
}
