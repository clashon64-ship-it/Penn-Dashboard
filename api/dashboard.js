// Vercel serverless function: GET /api/dashboard
//
// Reads the private Google Sheet server-side (via api/_sheet.js, which uses a
// service account) and returns normalized contacts to the dashboard. Same
// origin as the frontend, so no CORS handling is required. No Zapier — this
// talks to the Google Sheets API directly through `googleapis`.

import { loadContacts } from './_sheet.js'

export default async function handler(_req, res) {
  try {
    const contacts = await loadContacts()
    res.status(200).json({
      contacts,
      count: contacts.length,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to read the Google Sheet:', err.message)
    res.status(502).json({
      error: 'Failed to read the Google Sheet',
      detail: err.message,
    })
  }
}
