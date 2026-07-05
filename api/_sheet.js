// Shared Google Sheets reader used by both the Vercel serverless function
// (api/dashboard.js) and the standalone Express server (server/index.js).
// Reads the private sheet with a service account and returns normalized
// contacts. Nothing here ever runs in the browser.

import { google } from 'googleapis'

const SHEET_RANGE = process.env.SHEET_RANGE || 'Sheet1!A:S'
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60)

// Column order in the sheet (A -> S). Keep in sync with SHEET_RANGE.
export const COLUMNS = [
  'firstName', 'lastName', 'email', 'company', 'title', 'industry',
  'employeeCount', 'location', 'linkedinUrl', 'source', 'outreachStatus',
  'dateSent', 'emailSubject', 'notes', 'emailBody', 'phone',
  'emailConfidence', 'contactScore', 'humanReviewNeeded',
]

const NUMERIC = new Set(['employeeCount', 'contactScore'])

export function toNumber(raw) {
  if (raw == null || raw === '') return 0
  const n = Number(String(raw).replace(/[$,%\s]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function rowToContact(row) {
  const contact = {}
  COLUMNS.forEach((key, i) => {
    const value = row[i] ?? ''
    contact[key] = NUMERIC.has(key) ? toNumber(value) : String(value).trim()
  })
  return contact
}

// Auth via a service account. Two supported credential sources:
//   - GOOGLE_CREDENTIALS_JSON: the full service-account JSON inline (best for
//     hosted/serverless — store it as a secret env var, no file on disk).
//   - GOOGLE_APPLICATION_CREDENTIALS: a path to the JSON key file (local dev).
let authClient
export function getAuth() {
  if (authClient) return authClient
  const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
    authClient = new google.auth.GoogleAuth({ credentials, scopes })
  } else {
    authClient = new google.auth.GoogleAuth({ scopes })
  }
  return authClient
}

let cache = { at: 0, contacts: null }

/**
 * Read the sheet and return normalized contacts. Results are cached briefly
 * (CACHE_TTL_SECONDS) to avoid hammering the Sheets API on every request.
 */
export async function loadContacts() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEET_ID')

  const fresh = Date.now() - cache.at < CACHE_TTL_SECONDS * 1000
  if (cache.contacts && fresh) return cache.contacts

  const sheets = google.sheets({ version: 'v4', auth: getAuth() })
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  })

  const rows = data.values || []
  // Drop the header row, then ignore empty rows (no name and no company).
  const contacts = rows
    .slice(1)
    .filter((r) => r.length && (r[0] || r[3]))
    .map(rowToContact)

  cache = { at: Date.now(), contacts }
  return contacts
}
