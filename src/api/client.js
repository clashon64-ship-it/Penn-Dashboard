import { sampleData } from './sampleData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const TOKEN = import.meta.env.VITE_API_TOKEN || ''

export const usingSampleData = !BASE_URL

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
 * Fetch the full dashboard payload.
 *
 * When VITE_API_BASE_URL is set, this expects a single `/dashboard` endpoint
 * returning { kpis, timeseries, categories, transactions }. Swap the endpoint
 * shape here to match your real API without touching the components.
 */
export async function fetchDashboard() {
  if (usingSampleData) {
    return delay(sampleData)
  }
  return request('/dashboard')
}
