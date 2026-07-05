// Optional standalone Express proxy — an alternative to the Vercel serverless
// function (api/dashboard.js) for local dev or non-Vercel hosts. It shares the
// same sheet-reading core (api/_sheet.js) so the two can't drift. No Zapier:
// reads the Google Sheets API directly via a service account.
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { loadContacts } from '../api/_sheet.js'
import { loadExpenses } from '../api/_expenses.js'

const {
  GOOGLE_SHEET_ID,
  SHEET_RANGE = 'Sheet1!A:S',
  PORT = 8787,
  ALLOWED_ORIGIN = '*',
} = process.env

if (!GOOGLE_SHEET_ID) {
  console.error('Missing GOOGLE_SHEET_ID. See server/.env.example.')
  process.exit(1)
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

app.get('/expenses', async (_req, res) => {
  try {
    const { available, expenses } = await loadExpenses()
    res.json({ available, expenses, count: expenses.length, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Failed to read Expenses tab:', err.message)
    res.status(502).json({ error: 'Failed to read the Expenses tab', detail: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Penn Dashboard proxy listening on http://localhost:${PORT}`)
  console.log(`Reading ${SHEET_RANGE} from sheet ${GOOGLE_SHEET_ID}`)
})
