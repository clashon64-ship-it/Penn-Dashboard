import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'
import 'dotenv/config'

const {
  GOOGLE_SHEET_ID,
  SHEET_RANGE = 'Sheet1!A:S',
  PORT = 8787,
  ALLOWED_ORIGIN = '*',
  CACHE_TTL_SECONDS = 60,
} = process.env

if (!GOOGLE_SHEET_ID) {
  console.error('Missing GOOGLE_SHEET_ID. See server/.env.example.')
  process.exit(1)
}

// Column order in the sheet (A -> S). Keep in sync with SHEET_RANGE.
const COLUMNS = [
  'firstName', 'lastName', 'email', 'company', 'title', 'industry',
  'employeeCount', 'location', 'linkedinUrl', 'source', 'outreachStatus',
  'dateSent', 'emailSubject', 'notes', 'emailBody', 'phone',
  'emailConfidence', 'contactScore', 'humanReviewNeeded',
]

const NUMERIC = new Set(['employeeCount', 'contactScore'])

function toNumber(raw) {
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
//   - GOOGLE_APPLICATION_CREDENTIALS: a path to the JSON key file (best for
//     local dev). This is the GoogleAuth default when the var above is unset.
// Either way, nothing secret ships to the browser.
function buildAuth() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
    return new google.auth.GoogleAuth({ credentials, scopes })
  }
  return new google.auth.GoogleAuth({ scopes })
}

const auth = buildAuth()

let cache = { at: 0, contacts: null }

async function loadContacts() {
  const fresh = Date.now() - cache.at < Number(CACHE_TTL_SECONDS) * 1000
  if (cache.contacts && fresh) return cache.contacts

  const sheets = google.sheets({ version: 'v4', auth })
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
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

const app = express()
app.use(cors({ origin: ALLOWED_ORIGIN }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/dashboard', async (_req, res) => {
  try {
    const contacts = await loadContacts()
    res.json({ contacts, count: contacts.length, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Failed to read sheet:', err.message)
    res.status(502).json({ error: 'Failed to read the Google Sheet', detail: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Penn Dashboard proxy listening on http://localhost:${PORT}`)
  console.log(`Reading ${SHEET_RANGE} from sheet ${GOOGLE_SHEET_ID}`)
})
